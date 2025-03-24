import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRight, CheckCircle } from "lucide-react";
import { validateTokenFormat } from "@/lib/utils";
import { tokenSchema, TokenInput } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { motion } from "framer-motion";
import { fadeIn, popIn, slideInUp, buttonTap } from "@/lib/animation";

interface TokenInputFormProps {
  onSubmit: (token: string) => void;
}

export default function TokenInputForm({ onSubmit }: TokenInputFormProps) {
  const [isValidFormat, setIsValidFormat] = useState<boolean>(false);

  const form = useForm<TokenInput>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: "",
    },
  });

  const handleTokenInput = (value: string) => {
    setIsValidFormat(validateTokenFormat(value));
  };

  const handleSubmit = (data: TokenInput) => {
    onSubmit(data.token);
  };

  return (
    <motion.div 
      variants={fadeIn}
      className="p-6 border-b border-neutral-200 dark:border-neutral-800"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="tokenInput" className="block text-sm font-medium mb-2">
                  Discord Token
                </Label>
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <FormControl>
                    <Input 
                      id="tokenInput"
                      placeholder="Enter your Discord token here"
                      className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-neutral-800 dark:text-white text-sm shadow-sm transition-all duration-200"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleTokenInput(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isValidFormat && field.value.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm"
                    >
                      <CheckCircle className="h-5 w-5 text-success" />
                    </motion.div>
                  )}
                </motion.div>
                <FormMessage className="mt-1.5 text-error text-xs" />
              </FormItem>
            )}
          />
          <motion.div whileTap={buttonTap}>
            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
              disabled={!isValidFormat}
            >
              <span>Verify Token</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.p 
            variants={fadeIn}
            className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-3"
          >
            Your token is never stored outside of your device
          </motion.p>
        </form>
      </Form>
    </motion.div>
  );
}
