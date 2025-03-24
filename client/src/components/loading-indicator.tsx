import { motion } from "framer-motion";

export default function LoadingIndicator() {
  return (
    <div className="p-10 flex flex-col items-center justify-center">
      <div className="relative">
        <motion.div 
          className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-3 h-3 bg-primary rounded-full" />
        </motion.div>
      </div>
      
      <motion.div
        className="mt-5 flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-primary font-medium">Verifying token</p>
        <div className="flex space-x-1 mt-2">
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2 }}
          />
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.3, delay: 0.1 }}
          />
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.4, delay: 0.2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
