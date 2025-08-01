import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Lightbulb, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  updateSOAPField,
  updateSOAPCharCount,
  setSuggestedCodes,
  setSuggestedServiceCodes,
  setLoading
} from '../store/slices/medicalSlice';
import { generateCodeSuggestions } from '../services/medicalCodes';

export const SOAPInput = () => {
  const dispatch = useAppDispatch();
  const { soapNote, isLoading } = useAppSelector((state) => state.medical);

  const MAX_CHARS = 2000;

  const handleFieldChange = async (field: 'subjective' | 'objective' | 'assessment' | 'plan', value: string) => {
    if (value.length <= MAX_CHARS) {
      dispatch(updateSOAPField({ field, value }));
      dispatch(updateSOAPCharCount({ field, count: value.length }));
      
      // Live suggestions after 100 characters of total content
      const fullNote = field === 'subjective' ? value + soapNote.objective + soapNote.assessment + soapNote.plan :
                      field === 'objective' ? soapNote.subjective + value + soapNote.assessment + soapNote.plan :
                      field === 'assessment' ? soapNote.subjective + soapNote.objective + value + soapNote.plan :
                      soapNote.subjective + soapNote.objective + soapNote.assessment + value;
      
      if (fullNote.length >= 100 && !isLoading) {
        await handleSuggestCodes(undefined, false);
      }
    }
  };

  const handleSuggestCodes = async (e?: React.MouseEvent<HTMLButtonElement>, showLoading = true) => {
    if (showLoading) {
      dispatch(setLoading(true));
    }
    try {
      const fullNote = `${soapNote.subjective} ${soapNote.objective} ${soapNote.assessment} ${soapNote.plan}`;
      const { diagnosisCodes, serviceCodes } = await generateCodeSuggestions(fullNote);
      dispatch(setSuggestedCodes(diagnosisCodes));
      dispatch(setSuggestedServiceCodes(serviceCodes));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };
const isSOAPEmpty = !soapNote.subjective && !soapNote.objective && !soapNote.assessment && !soapNote.plan;
const fullNote = `${soapNote.subjective} ${soapNote.objective} ${soapNote.assessment} ${soapNote.plan}`.trim();


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
            <div className="space-y-2">
              <Textarea
                id="subjective"
                placeholder="Patient's chief complaint, symptoms, and reason for consultation..."
                value={soapNote.subjective}
                onChange={(e) => handleFieldChange('subjective', e.target.value)}
                className="min-h-[120px] border-medical-primary/20 focus:border-medical-primary/40 rounded-lg resize-none transition-all duration-200"
                maxLength={MAX_CHARS}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{soapNote.subjective.length} / {MAX_CHARS}</span>
                <Progress value={(soapNote.subjective.length / MAX_CHARS) * 100} className="w-32 h-1" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-medical-secondary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-medical-secondary">O</span>
              </div>
              <Label htmlFor="objective" className="text-base font-medium">Objective</Label>
            </div>
            <div className="space-y-2">
              <Textarea
                id="objective"
                placeholder="Physical examination findings, vital signs, and assessment details..."
                value={soapNote.objective}
                onChange={(e) => handleFieldChange('objective', e.target.value)}
                className="min-h-[120px] border-medical-secondary/20 focus:border-medical-secondary/40 rounded-lg resize-none transition-all duration-200"
                maxLength={MAX_CHARS}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{soapNote.objective.length} / {MAX_CHARS}</span>
                <Progress value={(soapNote.objective.length / MAX_CHARS) * 100} className="w-32 h-1" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-medical-accent/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-medical-accent">A</span>
              </div>
              <Label htmlFor="assessment" className="text-base font-medium">Assessment</Label>
            </div>
            <div className="space-y-2">
              <Textarea
                id="assessment"
                placeholder="Clinical assessment, differential diagnosis, and visit type (consultation/emergency)..."
                value={soapNote.assessment}
                onChange={(e) => handleFieldChange('assessment', e.target.value)}
                className="min-h-[120px] border-medical-accent/20 focus:border-medical-accent/40 rounded-lg resize-none transition-all duration-200"
                maxLength={MAX_CHARS}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{soapNote.assessment.length} / {MAX_CHARS}</span>
                <Progress value={(soapNote.assessment.length / MAX_CHARS) * 100} className="w-32 h-1" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-medical-warning/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-medical-warning">P</span>
              </div>
              <Label htmlFor="plan" className="text-base font-medium">Plan</Label>
            </div>
            <div className="space-y-2">
              <Textarea
                id="plan"
                placeholder="Treatment plan, medications, procedures, and follow-up appointment details..."
                value={soapNote.plan}
                onChange={(e) => handleFieldChange('plan', e.target.value)}
                className="min-h-[120px] border-medical-warning/20 focus:border-medical-warning/40 rounded-lg resize-none transition-all duration-200"
                maxLength={MAX_CHARS}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{soapNote.plan.length} / {MAX_CHARS}</span>
                <Progress value={(soapNote.plan.length / MAX_CHARS) * 100} className="w-32 h-1" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-border/50">
          {fullNote.length > 0 && fullNote.length < 100 && (
            <p className="text-sm text-muted-foreground">
              Add {100 - fullNote.length} more characters for live suggestions
            </p>
          )}
          <Button
            onClick={(e) => handleSuggestCodes(e, true)}
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