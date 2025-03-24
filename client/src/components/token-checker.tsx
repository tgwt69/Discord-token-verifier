import { useTheme } from "@/hooks/use-theme";
import TokenInputForm from "./token-input-form";
import BulkTokenForm from "./bulk-token-form";
import LoadingIndicator from "./loading-indicator";
import EmptyState from "./empty-state";
import ErrorState from "./error-state";
import AccountInfo from "./account-info";
import TokenResultsList from "./token-results-list";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TokenResult } from "@shared/schema";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Moon, Sun, ListFilter, User, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, slideInUp, staggerChildren, buttonTap, popIn } from "@/lib/animation";

type CheckMode = "single" | "bulk";

export default function TokenChecker() {
  const { theme, toggleTheme } = useTheme();
  const [checkMode, setCheckMode] = useState<CheckMode>("single");
  const [currentToken, setCurrentToken] = useState<string>("");
  const [tokenResults, setTokenResults] = useState<TokenResult[]>([]);
  
  // Mutation for checking a single token
  const singleCheckMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest("POST", "/api/check-token", { token });
      return response.json() as Promise<TokenResult>;
    },
    onSuccess: (result) => {
      setTokenResults([result]);
    }
  });

  // Mutation for checking multiple tokens
  const bulkCheckMutation = useMutation({
    mutationFn: async (tokens: string) => {
      const response = await apiRequest("POST", "/api/check-tokens", { tokens });
      return response.json() as Promise<{results: TokenResult[], count: {total: number, valid: number, invalid: number}, truncated: boolean}>;
    },
    onSuccess: (data) => {
      setTokenResults(data.results);
    }
  });

  const isPending = singleCheckMutation.isPending || bulkCheckMutation.isPending;
  const isError = singleCheckMutation.isError || bulkCheckMutation.isError;
  const error = singleCheckMutation.error || bulkCheckMutation.error;

  // Check a single token
  const checkSingleToken = (inputToken: string) => {
    setCurrentToken(inputToken);
    setTokenResults([]);
    singleCheckMutation.mutate(inputToken);
  };

  // Check multiple tokens
  const checkBulkTokens = (inputTokens: string) => {
    setTokenResults([]);
    bulkCheckMutation.mutate(inputTokens);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCheckMode(value as CheckMode);
    // Clear previous results when switching modes
    setTokenResults([]);
  };

  // Get stats for bulk check
  const getStats = () => {
    const validCount = tokenResults.filter(r => r.valid).length;
    const invalidCount = tokenResults.filter(r => !r.valid).length;
    
    return {
      total: tokenResults.length,
      valid: validCount,
      invalid: invalidCount
    };
  };

  return (
    <motion.div 
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xl"
    >
      {/* Header Section */}
      <motion.div 
        variants={slideInUp}
        className="mb-8 text-center"
      >
        <motion.h1 
          variants={popIn}
          className="text-3xl font-bold mb-3 flex items-center justify-center text-primary"
        >
          <motion.svg 
            whileHover={{ rotate: 10 }}
            className="h-8 w-8 mr-3 text-primary" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12 0-1.17.84-2.12 1.89-2.12 1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12 0-1.17.84-2.12 1.89-2.12 1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
          </motion.svg>
          Discord Token Checker
        </motion.h1>
        <motion.p 
          variants={fadeIn}
          className="text-secondary dark:text-neutral-200 text-base"
        >
          Verify Discord tokens and view account details securely
        </motion.p>
        <motion.div
          variants={fadeIn}
          className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary"
        >
          <Shield className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">Safe & Secure</span>
        </motion.div>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        variants={fadeIn}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
      >
        {/* Tab Navigation */}
        <Tabs defaultValue="single" onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <TabsList className="w-full grid grid-cols-2 bg-transparent">
              <TabsTrigger 
                value="single" 
                className="data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-700 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                Single Token
              </TabsTrigger>
              <TabsTrigger 
                value="bulk" 
                className="data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-700 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
              >
                <ListFilter className="h-4 w-4 mr-2" />
                Bulk Check
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Single Token Form */}
          <TabsContent value="single" className="mt-0">
            <TokenInputForm onSubmit={checkSingleToken} />
          </TabsContent>

          {/* Bulk Token Form */}
          <TabsContent value="bulk" className="mt-0">
            <BulkTokenForm onSubmit={checkBulkTokens} />
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingIndicator />
            </motion.div>
          )}

          {/* Empty State */}
          {!isPending && tokenResults.length === 0 && !isError && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState />
            </motion.div>
          )}

          {/* Error State */}
          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorState message={error?.message || "Failed to verify token"} />
            </motion.div>
          )}

          {/* Results */}
          {!isPending && tokenResults.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Single Token - Full Account Info */}
              {checkMode === "single" && tokenResults[0].valid && tokenResults[0].user && (
                <AccountInfo user={tokenResults[0].user} />
              )}

              {/* Single Token - Error */}
              {checkMode === "single" && !tokenResults[0].valid && (
                <ErrorState message={tokenResults[0].error || "Invalid token"} />
              )}

              {/* Bulk Results */}
              {checkMode === "bulk" && (
                <TokenResultsList results={tokenResults} stats={getStats()} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Info */}
      <motion.div 
        variants={fadeIn}
        className="mt-5 text-center text-xs text-secondary bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-lg"
      >
        <p>This tool verifies tokens and displays account information.</p>
        <p className="mt-1">Valid tokens are saved for quick reference in the Saved Tokens section.</p>
      </motion.div>

      {/* Dark Mode Toggle */}
      <motion.div 
        className="mt-6 flex justify-center"
        variants={fadeIn}
      >
        <motion.div whileTap={buttonTap}>
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-lg text-secondary dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 transition-all duration-300"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
