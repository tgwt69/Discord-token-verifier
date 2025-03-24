import { AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { fadeIn, slideInUp } from "@/lib/animation";

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-red-50 dark:bg-red-900/20 border border-error/20 rounded-xl p-6 text-center"
        variants={slideInUp}
      >
        <motion.div 
          className="relative w-16 h-16 mx-auto mb-4"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -5, 0, 5, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="absolute inset-0 bg-red-200 dark:bg-red-800/40 rounded-full opacity-50"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.3, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className="w-16 h-16 bg-red-100 dark:bg-red-800/30 text-error rounded-full flex items-center justify-center"
          >
            <XCircle className="h-8 w-8" />
          </motion.div>
        </motion.div>
        
        <motion.h3 
          className="font-semibold text-error text-lg mb-2"
          variants={fadeIn}
        >
          Invalid Token
        </motion.h3>
        
        <motion.p 
          className="text-gray-600 dark:text-neutral-300 mb-4"
          variants={fadeIn}
        >
          {message}
        </motion.p>
        
        <motion.div 
          className="mt-2"
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-gray-600 dark:text-neutral-300 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Try Again
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
