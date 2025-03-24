import { TokenResult } from "@shared/schema";
import { getAvatarUrl } from "@/lib/utils";
import { CheckCircle, XCircle, Copy, User, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface TokenResultsListProps {
  results: TokenResult[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export default function TokenResultsList({ results, stats }: TokenResultsListProps) {
  const { toast } = useToast();
  
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
  
  return (
    <div className="p-4">
      {/* Stats Header */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-neutral-100 dark:bg-neutral-700 p-2 rounded-md">
          <div className="text-xs text-secondary">Total</div>
          <div className="text-lg font-semibold">{stats.total}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
          <div className="text-xs text-green-600 dark:text-green-400">Valid</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">{stats.valid}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
          <div className="text-xs text-red-600 dark:text-red-400">Invalid</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">{stats.invalid}</div>
        </div>
      </div>
      
      {/* Results List */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`border rounded-md p-3 ${
              result.valid 
                ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50" 
                : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {result.valid ? (
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
                )}
                <span className={`text-sm font-medium ${
                  result.valid 
                    ? "text-green-700 dark:text-green-300" 
                    : "text-red-700 dark:text-red-300"
                }`}>
                  {result.valid ? "Valid Token" : "Invalid Token"}
                </span>
              </div>
              
              {result.valid && result.user && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <User className="h-3 w-3" /> 
                  {result.user.username}
                </Badge>
              )}
            </div>
            
            {/* User Info for Valid Tokens */}
            {result.valid && result.user && (
              <div className="mt-1 mb-2 flex items-center">
                <img 
                  src={getAvatarUrl(result.user?.id || '', result.user?.avatar || null)} 
                  alt={result.user?.username || 'User'} 
                  className="h-6 w-6 rounded-full mr-2"
                />
                <div className="text-xs">
                  <div className="font-medium">{result.user?.username}</div>
                  <div className="text-secondary">ID: {result.user?.id}</div>
                </div>
              </div>
            )}
            
            {/* Error Message for Invalid Tokens */}
            {!result.valid && result.error && (
              <div className="mt-1 mb-2 text-xs text-red-600 dark:text-red-400">
                {result.error}
              </div>
            )}
            
            {/* Token Display */}
            <div className="mt-2 text-xs font-mono bg-white dark:bg-neutral-800 p-2 rounded flex justify-between items-center">
              <div className="truncate max-w-[85%]">
                {result.token.substring(0, 25)}...{result.token.substring(result.token.length - 10)}
              </div>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={() => copyToClipboard(result.token)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {result.valid && result.user && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => window.open(`https://discord.com/developers/applications/${result.user?.id}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}