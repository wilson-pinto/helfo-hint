import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Activity, AlertCircle, Brain, ShieldQuestion } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { useAppDispatch } from '@/hooks/redux';
import { IDiagnosisCodeSuggestion, ICodeMatch } from '@/types';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface CodeSuggestionsProps {
  suggestions: IDiagnosisCodeSuggestion[];
  error?: string;
}

export const CodeSuggestions = ({ suggestions, error }: CodeSuggestionsProps) => {
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
        {suggestions.map((item, idx) => (
          <div key={item.concept + idx} className="border-b">
            <div className="font-semibold text-medical-foreground/80 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>{item.concept}</span>
            </div>
            {item?.matches?.every(m => !m.code) ? (
              <div className="text-sm ms-6 text-medical-error mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {item.matches.length ? item.matches[0].reason : 'No matches above similarity threshold.'}
              </div>
            ) : (
              <div className="space-y-2">
                {item.matches.map((match, mIdx) => (
                  <motion.div
                    key={item.concept + mIdx + (match.code ?? '')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between ms-6 mb-4 p-3 rounded-lg border hover:bg-medical-neutral transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="font-mono">
                        {match.code ?? 'No code'}
                      </Badge>
                      <div>
                        <p className="font-medium text-md">{match.description ?? 'No description'}</p>
                        <p className="text-xs text-muted-foreground">Similarity: {match.similarity !== null ? match.similarity.toFixed(2) : 'N/A'}</p>
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
                              {match.reason}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {match.code && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(match.code!)}
                        >
                          {copiedCode === match.code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
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