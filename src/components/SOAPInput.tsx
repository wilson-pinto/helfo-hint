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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          SOAP Note Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subjective">Subjective</Label>
            <Textarea
              id="subjective"
              placeholder="Patient's chief complaint, symptoms, and history..."
              value={soapNote.subjective}
              onChange={(e) => handleFieldChange('subjective', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Objective</Label>
            <Textarea
              id="objective"
              placeholder="Physical examination findings, vital signs, lab results..."
              value={soapNote.objective}
              onChange={(e) => handleFieldChange('objective', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assessment">Assessment</Label>
            <Textarea
              id="assessment"
              placeholder="Clinical impression, differential diagnosis..."
              value={soapNote.assessment}
              onChange={(e) => handleFieldChange('assessment', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Textarea
              id="plan"
              placeholder="Treatment plan, medications, follow-up..."
              value={soapNote.plan}
              onChange={(e) => handleFieldChange('plan', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-center">
          <Button 
            onClick={handleSuggestCodes}
            disabled={isLoading || isSOAPEmpty}
            className="bg-medical-primary hover:bg-medical-primary/90"
            size="lg"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {isLoading ? 'Generating Suggestions...' : 'Suggest Codes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};