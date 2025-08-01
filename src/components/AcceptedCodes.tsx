import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Copy } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { removeAcceptedCode } from '../store/slices/medicalSlice';
import { useToast } from '@/hooks/use-toast';

export const AcceptedCodes = () => {
  const dispatch = useAppDispatch();
  const { acceptedCodes } = useAppSelector((state) => state.medical);
  const { toast } = useToast();

  const copyToClipboard = () => {
    const codesText = acceptedCodes
      .map(code => `${code.code} - ${code.description} (${code.system})`)
      .join('\n');
    
    navigator.clipboard.writeText(codesText).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Accepted codes have been copied to your clipboard.",
      });
    });
  };

  if (acceptedCodes.length === 0) {
    return null;
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-medical-success" />
            Accepted Codes ({acceptedCodes.length})
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {acceptedCodes.map((code) => (
          <div key={code.id} className="flex items-center justify-between p-3 bg-medical-success/10 border border-medical-success/20 rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono border-medical-success text-medical-success">
                  {code.code}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {code.system}
                </Badge>
              </div>
              <p className="text-sm font-medium">{code.description}</p>
              <p className="text-xs text-muted-foreground capitalize">{code.type}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatch(removeAcceptedCode(code.id))}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};