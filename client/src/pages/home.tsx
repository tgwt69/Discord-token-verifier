import TokenChecker from "@/components/token-checker";
import { motion } from "framer-motion";
import { slideInUp } from "@/lib/animation";

export default function Home() {
  return (
    <motion.div 
      className="w-full flex items-center justify-center"
      initial="hidden"
      animate="visible"
      variants={slideInUp}
    >
      <TokenChecker />
    </motion.div>
  );
}
