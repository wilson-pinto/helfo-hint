import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Check, X, HelpCircle, Activity, Stethoscope } from 'lucide-react';
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
  const serviceCodes = suggestedCodes.filter(code => code.type === 'service');

  if (suggestedCodes.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Suggested Codes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {diagnosisCodes.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Diagnosis Codes (ICD-10 / ICPC-2)
            </h3>
            <div className="space-y-3">
              {diagnosisCodes.map((code) => (
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
                            This code was suggested based on keywords and symptoms mentioned in your SOAP note.
                            Confidence is based on relevance to the clinical presentation.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {serviceCodes.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
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
        )}
      </CardContent>
    </Card>
  );
};