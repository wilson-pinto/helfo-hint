import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { medicalClasses } from '../theme/colors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, Check, X, HelpCircle, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { acceptCode, rejectCode } from '../store/slices/medicalSlice';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const ServiceCodeSuggestions = () => {
  const dispatch = useAppDispatch();
  const { suggestedServiceCodes } = useAppSelector((state) => state.medical);

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

  const serviceCodes = suggestedServiceCodes;

  if (serviceCodes.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 bg-medical-surface">
        <CardHeader className="bg-gradient-to-r from-medical-secondary/5 to-medical-primary/5">
          <CardTitle className="flex items-center gap-2 text-medical-secondary">
          <Activity className="h-5 w-5" />
          AI-Generated Service Code Suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Service codes automatically suggested based on your SOAP note content
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-medical-secondary">
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
            {serviceCodes.map((code) => (
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
                    onClick={() => dispatch(acceptCode({ id: code.id, type: 'service' }))}
                    className={medicalClasses.button.success}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => dispatch(rejectCode({ id: code.id, type: 'service' }))}
                    className={`${medicalClasses.button.error} hover:opacity-90`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="ghost" className="hover:bg-medical-neutral">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-medical-secondary">Why this suggestion?</h4>
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
      </CardContent>
      </Card>
    </motion.div>
  );
};