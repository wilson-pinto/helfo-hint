import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, X, Copy, Trash2, Stethoscope, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { removeAcceptedCode, setAcceptedCodesFilter, setAcceptedCodesSort } from '../store/slices/medicalSlice';
import { selectFilteredAndSortedAcceptedCodes } from '../store/selectors/medicalSelectors';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const AcceptedCodes = () => {
  const dispatch = useAppDispatch();
  const acceptedCodes = useAppSelector(selectFilteredAndSortedAcceptedCodes);
  const filter = useAppSelector((state) => state.medical.ui.acceptedCodesFilter);
  const sort = useAppSelector((state) => state.medical.ui.acceptedCodesSort);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-4"
    >
      <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-medical-success" />
              Accepted Codes ({acceptedCodes.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={(value) => dispatch(setAcceptedCodesFilter(value as 'all' | 'diagnosis' | 'service'))}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Codes</SelectItem>
                  <SelectItem value="diagnosis">Diagnosis</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(value) => dispatch(setAcceptedCodesSort(value as 'newest' | 'oldest' | 'type' | 'system'))}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="type">By Type</SelectItem>
                  <SelectItem value="system">By System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy All
            </Button>
            {acceptedCodes.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all accepted codes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all accepted diagnosis and service codes. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => acceptedCodes.forEach(code => dispatch(removeAcceptedCode(code.id)))}
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {acceptedCodes.map((code) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-between p-3 ${
                  code.type === 'diagnosis'
                    ? 'bg-medical-primary/10 border-medical-primary/20 hover:bg-medical-primary/20'
                    : 'bg-medical-secondary/10 border-medical-secondary/20 hover:bg-medical-secondary/20'
                } border rounded-lg transition-colors`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`font-mono ${
                        code.type === 'diagnosis'
                          ? 'border-medical-primary text-medical-primary'
                          : 'border-medical-secondary text-medical-primary'
                      }`}
                    >
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
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </CardContent>
      </Card>
    </motion.div>
  );
};