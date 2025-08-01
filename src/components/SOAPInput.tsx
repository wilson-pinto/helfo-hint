import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, Lightbulb } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateSOAPField, setSuggestedCodes, setLoading } from '../store/slices/medicalSlice';
import { generateCodeSuggestions } from '../services/medicalCodes';

export const SOAPInput = () => {
  const dispatch = useAppDispatch();
  const { soapNote, isLoading } = useAppSelector((state) => state.medical);

  const handleFieldChange = (field: keyof typeof soapNote, value: string) => {
    dispatch(updateSOAPField({ field, value }));
  };

  const handleSuggestCodes = async () => {
    dispatch(setLoading(true));
    try {
      const fullNote = `${soapNote.subjective} ${soapNote.objective} ${soapNote.assessment} ${soapNote.plan}`;
      const suggestions = await generateCodeSuggestions(fullNote);
      dispatch(setSuggestedCodes(suggestions));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const isSOAPEmpty = !soapNote.subjective && !soapNote.objective && !soapNote.assessment && !soapNote.plan;

  return (
    <Card className="mb-6 border-medical-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-medical-primary/5 to-medical-secondary/5 border-b border-medical-primary/10">
        <CardTitle className="flex items-center gap-2 text-medical-primary">
          <FileText className="h-5 w-5" />
          SOAP Note Documentation
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Document patient information to generate relevant medical codes
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-medical-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-medical-primary">S</span>
              </div>
              <Label htmlFor="subjective" className="text-base font-medium">Subjective</Label>
            </div>
            <Textarea
              id="subjective"
              placeholder="Patient's chief complaint, symptoms, and history of present illness..."
              value={soapNote.subjective}
              onChange={(e) => handleFieldChange('subjective', e.target.value)}
              className="min-h-[120px] border-medical-primary/20 focus:border-medical-primary/40 rounded-lg"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-medical-secondary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-medical-secondary">O</span>
              </div>
              <Label htmlFor="objective" className="text-base font-medium">Objective</Label>
            </div>
            <Textarea
              id="objective"
              placeholder="Physical examination findings, vital signs, laboratory results..."
              value={soapNote.objective}
              onChange={(e) => handleFieldChange('objective', e.target.value)}
              className="min-h-[120px] border-medical-secondary/20 focus:border-medical-secondary/40 rounded-lg"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-medical-accent/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-medical-accent">A</span>
              </div>
              <Label htmlFor="assessment" className="text-base font-medium">Assessment</Label>
            </div>
            <Textarea
              id="assessment"
              placeholder="Clinical impression, differential diagnosis, clinical reasoning..."
              value={soapNote.assessment}
              onChange={(e) => handleFieldChange('assessment', e.target.value)}
              className="min-h-[120px] border-medical-accent/20 focus:border-medical-accent/40 rounded-lg"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-medical-warning/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-medical-warning">P</span>
              </div>
              <Label htmlFor="plan" className="text-base font-medium">Plan</Label>
            </div>
            <Textarea
              id="plan"
              placeholder="Treatment plan, medications, procedures, follow-up instructions..."
              value={soapNote.plan}
              onChange={(e) => handleFieldChange('plan', e.target.value)}
              className="min-h-[120px] border-medical-warning/20 focus:border-medical-warning/40 rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex justify-center pt-4 border-t border-border/50">
          <Button 
            onClick={handleSuggestCodes}
            disabled={isLoading || isSOAPEmpty}
            className="bg-gradient-to-r from-medical-primary to-medical-secondary hover:from-medical-primary/90 hover:to-medical-secondary/90 text-white shadow-lg"
            size="lg"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {isLoading ? 'Analyzing SOAP Note...' : 'Generate Code Suggestions'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};