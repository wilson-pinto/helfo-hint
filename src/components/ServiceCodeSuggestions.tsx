import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Check, X, HelpCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { acceptCode, rejectCode } from '../store/slices/medicalSlice';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const ServiceCodeSuggestions = () => {
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

  const serviceCodes = suggestedCodes.filter(code => code.type === 'service');

  if (serviceCodes.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-medical-secondary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-medical-secondary/5 to-medical-primary/5 border-b border-medical-secondary/10">
        <CardTitle className="flex items-center gap-2 text-medical-secondary">
          <Activity className="h-5 w-5" />
          AI-Generated Service Code Suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Service codes automatically suggested based on your SOAP note content
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="border border-medical-secondary/20 rounded-lg p-4 bg-gradient-to-br from-medical-secondary/5 to-transparent">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-3 text-medical-secondary">
            <div className="w-8 h-8 rounded-full bg-medical-secondary/10 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            Service Codes (HELFO / Tjenestekoder)
          </h3>
          <div className="space-y-3">
            {serviceCodes.map((code) => (
              <div key={code.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {code.code}
                  </Badge>
                  <div>
                    <p className="font-medium">{code.description}</p>
                    <p className="text-sm text-muted-foreground">{code.system}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getConfidenceColor(code.confidence)}`} />
                    <span className="text-sm font-medium">{code.confidence}%</span>
                    <span className="text-xs text-muted-foreground">
                      {getConfidenceText(code.confidence)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => dispatch(acceptCode(code.id))}
                    className="bg-medical-success hover:bg-medical-success/90"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dispatch(rejectCode(code.id))}
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
                        <h4 className="font-semibold">Why this suggestion?</h4>
                        <p className="text-sm">
                          This service code was suggested based on the type of consultation or procedure
                          indicated in your SOAP note documentation.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};