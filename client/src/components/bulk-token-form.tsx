import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bulkTokenSchema, type BulkTokenInput } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BulkTokenFormProps {
  onSubmit: (tokens: string) => void;
}

export default function BulkTokenForm({ onSubmit }: BulkTokenFormProps) {
  const [tokenCount, setTokenCount] = useState(0);

  const form = useForm<BulkTokenInput>({
    resolver: zodResolver(bulkTokenSchema),
    defaultValues: {
      tokens: "",
    },
  });

  const handleSubmit = (data: BulkTokenInput) => {
    onSubmit(data.tokens);
  };

  const handleTokensChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const tokens = value
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
    setTokenCount(tokens.length);
    form.setValue("tokens", value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tokens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tokens</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter tokens, one per line..."
                  className="min-h-[150px] font-mono text-xs"
                  {...field}
                  onChange={handleTokensChange}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Enter up to 100 Discord tokens, one per line
                {tokenCount > 0 && ` (${tokenCount} tokens detected)`}
                {tokenCount > 100 && " - only the first 100 will be processed"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting || tokenCount === 0}
        >
          Check Tokens
        </Button>
      </form>
    </Form>
  );
}