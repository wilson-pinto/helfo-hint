import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const IntroSection = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Enter SOAP notes to get code suggestions
            </h2>
            <div className="flex gap-4 text-sm">
              <a 
                href="https://www.who.int/standards/classifications/classification-of-diseases" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-medical-primary hover:underline flex items-center gap-1"
              >
                ICD-10 <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.wonca.net/groups/cic/icpc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-medical-primary hover:underline flex items-center gap-1"
              >
                ICPC-2 <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.helfo.no" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-medical-primary hover:underline flex items-center gap-1"
              >
                HELFO <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                SOAP Format Help
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-semibold">SOAP Note Format Example:</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Subjective:</strong> Patient reports nausea and stomach pain for 2 days</p>
                  <p><strong>Objective:</strong> Temperature 37.8°C, abdominal tenderness</p>
                  <p><strong>Assessment:</strong> Probable gastroenteritis</p>
                  <p><strong>Plan:</strong> Oral rehydration, follow-up in 3 days</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};