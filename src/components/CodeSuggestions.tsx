import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lightbulb, Check, X, HelpCircle, Activity, Stethoscope, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { acceptCode, rejectCode } from '../store/slices/medicalSlice';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const CodeSuggestions = () => {
  const dispatch = useAppDispatch();
  const { suggestedCodes } = useAppSelector((state) => state.medical);

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

  const diagnosisCodes = suggestedCodes.filter(code => code.type === 'diagnosis');

  if (diagnosisCodes.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 border-medical-warning/20">
        <CardHeader className="bg-medical-primary/10 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-medical-primary">
            <Activity className="h-5 w-5" />
            AI-Generated Diagnosis Code Suggestions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Diagnosis codes automatically suggested based on your SOAP note content
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div>
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
                {diagnosisCodes.map((code) => (
                  <motion.div
                    key={code.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-medical-neutral transition-colors bg-medical-surface"
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
                              {code.confidence >= 85 ? 'High confidence in this suggestion based on clear symptoms and clinical patterns' :
                                code.confidence >= 70 ? 'Moderate confidence based on partial symptom match' :
                                  'Lower confidence suggestion, may need review'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => dispatch(acceptCode({ id: code.id, type: 'diagnosis' }))}
                        className="bg-medical-success hover:bg-medical-success/90"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch(rejectCode({ id: code.id, type: 'diagnosis' }))}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size="sm" variant="ghost">
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
                              <li>Keywords and symptoms in SOAP note</li>
                              <li>Clinical presentation patterns</li>
                              <li>Common diagnostic associations</li>
                            </ul>
                            <p className="text-xs text-muted-foreground mt-2">
                              {code.confidence}% confidence based on match strength
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
        </CardContent>
      </Card>
    </motion.div>
  );
};