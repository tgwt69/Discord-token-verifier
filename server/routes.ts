import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tokenSchema, discordUserSchema, bulkTokenSchema, TokenResult } from "@shared/schema";
import { ZodError } from "zod";
import fetch from "node-fetch";

// Helper function to check a single token
async function checkToken(token: string): Promise<TokenResult> {
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
      
      return {
        token,
        valid: false,
        error: errorMessage
      };
    }

    // Parse Discord user data
    const userData = await response.json();
    const validatedUser = discordUserSchema.parse(userData);
    
    // Return the successful result
    return {
      token,
      valid: true,
      user: validatedUser
    };
  } catch (error) {
    console.error("Error checking token:", error);
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
      // Validate token format
      const { token } = tokenSchema.parse(req.body);
      
      // Check the token
      const result = await checkToken(token);
      
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
        return res.status(400).json({ 
          message: "Invalid token format. Token must be at least 50 characters and contain a period (.)" 
        });
      }
      
      console.error("Error in check-token endpoint:", error);
      return res.status(500).json({ 
        message: "Server error while checking token" 
      });
    }
  });
  
  // API endpoint to check multiple Discord tokens
  app.post("/api/check-tokens", async (req, res) => {
    try {
      // Parse the input as a string and split into tokens
      const { tokens: tokensInput } = req.body;
      
      // Ensure we have a string
      if (typeof tokensInput !== 'string') {
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
        return res.status(400).json({ 
          message: "No valid tokens provided. Please enter at least one token." 
        });
      }
      
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

  const httpServer = createServer(app);

  return httpServer;
}
