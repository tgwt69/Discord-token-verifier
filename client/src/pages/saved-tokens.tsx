import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import LoadingIndicator from "@/components/loading-indicator";
import ErrorState from "@/components/error-state";
import { formatDiscordTimestamp, getAvatarUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedToken {
  token: string;
  userId: string;
  username: string;
  timestamp: number;
  valid: boolean;
}

export default function SavedTokens() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "byUser">("all");
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  
  // Query for all saved tokens
  const { data: allTokensData, isLoading: isLoadingAll, isError: isErrorAll, error: errorAll } = useQuery({
    queryKey: ["/api/saved-tokens"],
    queryFn: getQueryFn<{ tokens: SavedToken[], count: number }>({
      on401: "throw"
    })
  });
  
  // Query for user-specific tokens (only executed when filter is "byUser" and userIdFilter is set)
  const { data: userTokensData, isLoading: isLoadingUser, isError: isErrorUser, error: errorUser, refetch: refetchUserTokens } = useQuery({
    queryKey: [`/api/saved-tokens/${userIdFilter}`],
    queryFn: getQueryFn<{ tokens: SavedToken[], count: number }>({
      on401: "throw"
    }),
    enabled: filter === "byUser" && !!userIdFilter
  });
  
  // Function to copy token to clipboard
  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token).then(() => {
      toast({
        title: "Token copied",
        description: "The token has been copied to your clipboard",
        duration: 3000
      });
    });
  };
  
  // Handle user ID input change
  const handleUserIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserIdFilter(e.target.value);
  };
  
  // Handle searching for a specific user
  const handleSearchClick = () => {
    if (userIdFilter) {
      refetchUserTokens();
    } else {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive"
      });
    }
  };
  
  // Get the appropriate data based on the current filter
  const tokensData = filter === "all" ? allTokensData : userTokensData;
  const isLoading = filter === "all" ? isLoadingAll : isLoadingUser;
  const isError = filter === "all" ? isErrorAll : isErrorUser;
  const error = filter === "all" ? errorAll : errorUser;
  
  // Display tokens in chronological order (newest first)
  const sortedTokens = tokensData?.tokens 
    ? [...tokensData.tokens].sort((a, b) => b.timestamp - a.timestamp) 
    : [];
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Saved Discord Tokens</h1>
        <p className="text-secondary dark:text-neutral-200 text-sm">
          View and manage stored valid tokens
        </p>
        <p className="text-xs text-primary mt-1 font-medium">by Jay</p>
      </div>
      
      {/* Main Content */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden">
        {/* Filter Tabs */}
        <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as "all" | "byUser")} className="w-full">
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <TabsList className="w-full grid grid-cols-2 bg-transparent">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-700 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                All Tokens
              </TabsTrigger>
              <TabsTrigger 
                value="byUser" 
                className="data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-700 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                By User ID
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* All Tokens Content */}
          <TabsContent value="all" className="p-4">
            {isLoading && <LoadingIndicator />}
            
            {isError && (
              <ErrorState 
                message={error?.message || "Failed to fetch saved tokens"} 
              />
            )}
            
            {!isLoading && !isError && sortedTokens.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  No tokens have been saved yet.
                </p>
                <p className="text-sm mt-2 text-neutral-400 dark:text-neutral-500">
                  Check some tokens to see them here.
                </p>
              </div>
            )}
            
            {!isLoading && !isError && sortedTokens.length > 0 && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-sm font-medium">
                    All Saved Tokens ({tokensData?.count || 0})
                  </h3>
                </div>
                <div className="space-y-3">
                  {renderTokenList(sortedTokens)}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* By User Content */}
          <TabsContent value="byUser" className="p-4">
            <div className="mb-4 flex space-x-2">
              <input
                type="text"
                placeholder="Enter user ID"
                value={userIdFilter}
                onChange={handleUserIdInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button onClick={handleSearchClick}>Search</Button>
            </div>
            
            {isLoadingUser && <LoadingIndicator />}
            
            {isErrorUser && (
              <ErrorState 
                message={errorUser?.message || "Failed to fetch user tokens"} 
              />
            )}
            
            {filter === "byUser" && userIdFilter && !isLoadingUser && !isErrorUser && (
              <>
                {userTokensData && userTokensData.tokens.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      Tokens for User ID: {userIdFilter} ({userTokensData.count})
                    </h3>
                    <div className="space-y-3">
                      {renderTokenList(sortedTokens)}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No tokens found for this user ID.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
  
  // Helper function to render token list
  function renderTokenList(tokens: SavedToken[]) {
    return tokens.map((token) => (
      <div key={token.token} className="border rounded-md p-3 bg-neutral-50 dark:bg-neutral-900">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <img 
              src={getAvatarUrl(token.userId, null)} 
              alt={token.username} 
              className="h-8 w-8 rounded-full mr-2"
            />
            <div>
              <div className="font-medium flex items-center">
                <User className="h-3 w-3 mr-1 inline" /> 
                {token.username}
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {token.userId}
              </div>
            </div>
          </div>
          <Badge>
            {new Date(token.timestamp).toLocaleString()}
          </Badge>
        </div>
        
        <div className="mt-2 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 p-2 rounded flex justify-between items-center">
          <div className="truncate max-w-[85%]">
            {token.token.substring(0, 25)}...{token.token.substring(token.token.length - 10)}
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => copyToClipboard(token.token)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => window.open(`https://discord.com/developers/applications/${token.userId}`, "_blank")}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          Account created: {formatDiscordTimestamp(token.userId)}
        </div>
      </div>
    ));
  }
}