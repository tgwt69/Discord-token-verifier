import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { fadeIn, slideInUp, staggerChildren } from "@/lib/animation";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="relative w-24 h-24 mb-8"
        variants={fadeIn}
      >
        <motion.div 
          className="absolute inset-0 bg-primary/10 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
          <motion.svg 
            className="h-12 w-12 text-primary" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12 0-1.17.84-2.12 1.89-2.12 1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12 0-1.17.84-2.12 1.89-2.12 1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
          </motion.svg>
        </motion.div>
      </motion.div>
      
      <motion.h1 
        className="text-4xl font-bold mb-4 text-primary"
        variants={slideInUp}
      >
        Discord Token Checker
      </motion.h1>
      
      <motion.p 
        className="text-lg text-gray-600 dark:text-gray-300 mb-2 max-w-lg"
        variants={fadeIn}
      >
        A secure tool to validate Discord tokens and view detailed account information
      </motion.p>
      
      <motion.div
        className="mb-8 mt-2 flex items-center justify-center"
        variants={fadeIn}
      >
        <div className="flex items-center space-x-2 bg-primary/10 text-primary text-sm rounded-full px-4 py-1">
          <ShieldCheck className="h-4 w-4" />
          <span>Secure & Private</span>
        </div>
      </motion.div>
      
      <motion.div 
        className="mb-12 flex flex-col items-center justify-center"
        variants={fadeIn}
        custom={3}
      >
        <p className="text-gray-500 dark:text-gray-400 mb-1">Created by</p>
        <h2 className="text-xl font-semibold text-primary">_imjay</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Join our Discord server at <a href="https://discord.gg/DbUKdVQR" className="text-primary hover:underline">discord.gg/DbUKdVQR</a>
        </p>
      </motion.div>
      
      <motion.div 
        variants={fadeIn}
        custom={4}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/token-checker">
          <Button className="px-8 py-6 text-lg font-medium rounded-xl shadow-lg" size="lg">
            <span>Start Checking Tokens</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}