import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Activity, AlertCircle, Brain, ShieldQuestion } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { useAppDispatch } from '@/hooks/redux';
import { ICodeSuggestion } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface CodeSuggestionsProps {
  codes: ICodeSuggestion[];
  type?: 'diagnosis' | 'service';
  error?: string;
}

export const CodeSuggestions = ({ codes, error, type }: CodeSuggestionsProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    toast({
      title: "Code Copied!",
      description: `${code} has been copied to clipboard`,
    });
    setTimeout(() => setCopiedId(null), 2000);
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

    if (codes.length === 0) {
      return (
        <p className="text-center text-muted-foreground">
          No code suggestions available for {type === 'diagnosis' ? 'diagnosis' : 'service'} codes. Add more details to your SOAP note.
        </p>
      );
    }

    return <div>
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {codes.map((code) => (
            <motion.div
              key={code.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-medical-neutral transition-colors"
            >
              <div className="flex items-center gap-3">
                <Badge variant="default" className="font-mono">
                  {code.code}
                </Badge>
                <div>
                  <p className="font-medium text-md">{code.description}</p>
                  {/* <p className="text-sm text-muted-foreground">{code.system}</p> */}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ShieldQuestion className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs p-4'>
                      <p className="text-sm">
                        {code.reason}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(code.code)}
                >
                  {copiedId === code.code ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 pb-4">
        <CardTitle>
          <span className="flex items-center gap-2 text-medical-foreground/80">
            {type === 'diagnosis' ? (
              <>
                <Brain className="h-4 w-4" />
                Diagnosis Codes
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                Service Codes
              </>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='py-4'>
        {cardContent()}
      </CardContent>
    </Card>
  )
};