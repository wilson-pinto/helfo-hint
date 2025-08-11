import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Check, HelpCircle, Activity, PieChart, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../hooks/redux';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { useToast } from '../hooks/use-toast';

export const ServiceCodeSuggestions = () => {
  const { suggestedServiceCodes, errors } = useAppSelector((state) => state.medical);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

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

  if (suggestedServiceCodes.length === 0 && !errors?.service) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 bg-medical-surface">
        <CardHeader className="bg-medical-primary/10 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-medical-primary">
            <Activity className="h-5 w-5" />
            AI-Generated Service Code Suggestions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Service codes automatically suggested based on your SOAP note content
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {errors?.service ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.service}</AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-medical-primary">
                        <PieChart className="h-4 w-4 mr-1" />
                        Confidence Levels
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2 p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-confidence-high" />
                          <span>High (85%+)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-confidence-medium" />
                          <span>Medium (70-84%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-confidence-low" />
                          <span>Low (&lt;70%)</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {suggestedServiceCodes.map((code) => (
                    <motion.div
                      key={code.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-medical-neutral bg-medical-surface"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {code.code}
                        </Badge>
                        <div>
                          <p className="font-medium">{code.description}</p>
                          <p className="text-sm text-muted-foreground">{code.system}</p>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-help">
                                <div className={`w-3 h-3 rounded-full ${getConfidenceColor(code.confidence)}`} />
                                <span className="text-sm font-medium">{code.confidence}%</span>
                                <span className="text-xs text-muted-foreground">
                                  {getConfidenceText(code.confidence)}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">
                                {code.confidence >= 85 ? 'High confidence based on clear service indicators' :
                                  code.confidence >= 70 ? 'Moderate confidence based on partial match' :
                                    'Lower confidence suggestion, please review'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleCopy(code.code)}
                          className="bg-medical-primary hover:bg-medical-primary/90"
                        >
                          {copiedId === code.code ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          {copiedId === code.code ? 'Copied!' : 'Copy Code'}
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button size="sm" variant="ghost" className="hover:bg-medical-neutral">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-medical-primary">Why this suggestion?</h4>
                              <p className="text-sm">
                                Suggested based on:
                              </p>
                              <ul className="text-sm space-y-1 list-disc pl-4">
                                <li>Type of consultation/procedure</li>
                                <li>Clinical service patterns</li>
                                <li>Common HELFO code associations</li>
                              </ul>
                              <p className="text-xs text-muted-foreground mt-2">
                                {code.confidence}% confidence based on service match
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};