import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {  generateDiagnosisCodeSuggestions, generateServiceCodeSuggestions, updateSOAPField } from '@/store/slices/medicalSlice';
import { generateCodeSuggestions } from '@/services/medicalCodes';

interface SOAPInputProps {
  hideGenerateButton?: boolean;
}

const MAX_CHARS = 500;

const soapSections = [
  {
    field: 'subjective',
    letter: 'S',
    title: 'Subjective',
    placeholder: 'Enter patient symptoms and history...',
    gradientClass: 'from-medical-primary to-medical-primary/70',
    textClass: 'text-white'
  },
  {
    field: 'objective',
    letter: 'O',
    title: 'Objective',
    placeholder: 'Enter examination findings...',
    gradientClass: 'from-medical-secondary to-medical-secondary/70',
    textClass: 'text-white'
  },
  {
    field: 'assessment',
    letter: 'A',
    title: 'Assessment',
    placeholder: 'Enter diagnosis and differential...',
    gradientClass: 'from-medical-info to-medical-info/70',
    textClass: 'text-white'
  },
  {
    field: 'plan',
    letter: 'P',
    title: 'Plan',
    placeholder: 'Enter treatment plan...',
    gradientClass: 'from-medical-warning to-medical-warning/70',
    textClass: 'text-white'
  }
];

export const SOAPInput = ({ hideGenerateButton = false }: SOAPInputProps) => {
  const dispatch = useAppDispatch();
  const { isLoading, soapNote } = useAppSelector((state: any) => state.medical);

  const fullNote = Object.values(soapNote).join('');
  const isSOAPEmpty = fullNote.trim().length === 0;

  type SOAPField = 'subjective' | 'objective' | 'assessment' | 'plan';

  const handleFieldChange = (field: SOAPField, value: string) => {
    console.log(field, value);
    
    dispatch(updateSOAPField({ field, value }));
  };

  const handleSuggestCodes = (e: React.MouseEvent<HTMLButtonElement>, forceUpdate = false) => {
    e.preventDefault();
    dispatch(generateDiagnosisCodeSuggestions({ soapNote }));
    dispatch(generateServiceCodeSuggestions({ soapNote }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-8">
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2 text-medical-foreground/80">
            <FileText className="h-5 w-5" />
            SOAP Note
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Enter patient information in SOAP format {!hideGenerateButton && 'to generate relevant medical codes'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {soapSections.map((section) => (
              <div key={section.field} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br shadow-sm",
                    section.gradientClass
                  )}>
                    <span className={cn(
                      "text-sm font-semibold",
                      section.textClass
                    )}>
                      {section.letter}
                    </span>
                  </div>
                  <Label htmlFor={section.field} className="text-base font-semibold text-medical-foreground/80">
                    {section.title}
                  </Label>
                </div>
                <div className="space-y-2">
                  <Textarea
                    id={section.field}
                    placeholder={section.placeholder}
                    value={soapNote[section.field]}
                    onChange={(e) => handleFieldChange(section.field as SOAPField, e.target.value)}
                    className={cn(
                      "min-h-[120px] rounded-lg resize-none transition-all duration-200",
                      "bg-white/50 hover:bg-white focus:bg-white",
                      "border hover:border-medical-primary/30",
                      "focus:border-medical-primary",
                      "placeholder:text-muted-foreground/50"
                    )}
                    maxLength={MAX_CHARS}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {soapNote[section.field].length} / {MAX_CHARS}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(soapNote[section.field].length / MAX_CHARS) * 100}
                        className={cn(
                          "w-32 h-1",
                          "bg-medical-neutral/20",
                          { "bg-medical-primary/20": section.field === 'subjective' },
                          { "bg-medical-secondary/20": section.field === 'objective' },
                          { "bg-medical-info/20": section.field === 'assessment' },
                          { "bg-medical-warning/20": section.field === 'plan' }
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hideGenerateButton && (
            <div className="flex flex-col items-end gap-2 pt-4 border-t border-medical-neutral/30">
              {fullNote.length > 0 && fullNote.length < 100 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  Add {100 - fullNote.length} more characters for live suggestions
                </motion.p>
              )}
              <Button
                onClick={(e) => handleSuggestCodes(e, true)}
                disabled={isLoading.suggestions || isSOAPEmpty}
                className={cn(
                  "bg-medical-primary hover:bg-medical-primary-hover",
                  "text-white shadow-md transition-all duration-200",
                  "hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98]"
                )}
                size="lg"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {isLoading.suggestions ? 'Analyzing SOAP Note...' : 'Generate Code Suggestions'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};