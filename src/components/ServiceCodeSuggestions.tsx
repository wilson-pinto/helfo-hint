import { useAppDispatch } from "@/hooks/redux";
import { useToast } from "@/hooks/use-toast";
import { ICodeSuggestion } from "@/types";
import { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Brain, HelpCircle } from "lucide-react";
import { motion } from 'framer-motion';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CodeSuggestionsProps {
  suggestions: ICodeSuggestion[];
  error?: string;
}

export const ServiceCodeSuggestions = ({ suggestions, error }: CodeSuggestionsProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const handleCopy = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Code Copied!",
      description: `${code} has been copied to clipboard`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-confidence-high';
    if (confidence >= 70) return 'bg-confidence-medium';
    return 'bg-confidence-low';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 85) return 'High';
    if (confidence >= 70) return 'Medium';
    return 'Low';
  };

  const cardContent = () => {
    if (error) {
      return <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    }

    if (!suggestions || suggestions.length === 0) {
      return (
        <p className="text-center text-muted-foreground">
          No code suggestions available. Add more details to your SOAP note.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {suggestions.map((code) => (
          <motion.div
            key={code.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between p-3 border rounded-lg transition-colors hover:bg-medical-neutral bg-medical-surface"
          >
            <div className="flex items-center">
              <Badge variant="outline" className="font-mono">
                {code.code}
              </Badge>
            </div>
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="ghost" className="hover:bg-medical-neutral">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-2">
                    <p className="p-4">
                      {code.description}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 pb-4">
        <CardTitle>
          <span className="flex items-center gap-2 text-medical-foreground/80">
            <Brain className="h-4 w-4" />
            Code Suggestions
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='py-4'>
        {cardContent()}
      </CardContent>
    </Card>
  )
};
