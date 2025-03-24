import { ShieldAlert, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, pulseAnimation } from "@/lib/animation";

export default function EmptyState() {
  return (
    <motion.div 
      className="p-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="relative w-20 h-20 mx-auto mb-6"
        whileHover={{ scale: 1.05 }}
      >
        <motion.div 
          className="absolute inset-0 bg-primary/10 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="w-20 h-20 bg-primary/20 dark:bg-primary/10 rounded-full flex items-center justify-center mx-auto"
        >
          <ShieldAlert className="h-8 w-8 text-primary" />
        </motion.div>
      </motion.div>
      
      <motion.h3 
        className="font-semibold text-lg mb-3 text-primary/90"
        variants={fadeIn}
      >
        Ready to Check Token
      </motion.h3>
      
      <motion.p 
        className="text-secondary dark:text-neutral-300 text-base max-w-xs mx-auto"
        variants={fadeIn}
      >
        Enter a Discord token above to verify its validity and view account details
      </motion.p>
      
      <motion.div 
        className="mt-6 flex flex-col items-center text-xs text-secondary/80"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ArrowUp className="h-4 w-4 mb-1" />
        <span>Enter token above</span>
      </motion.div>
    </motion.div>
  );
}
