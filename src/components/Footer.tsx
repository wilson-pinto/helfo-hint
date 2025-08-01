import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Github, MessageSquare, Book, Scale, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mt-8">
        <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Experimental tool for testing only. Not for clinical use.
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#feedback" onClick={(e) => e.preventDefault()}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </a>
            </Button>
          </div>
        </div>
        
          <div className="grid gap-6 mt-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Book className="h-4 w-4" />
                Official Documentation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="https://finnkode.ehelse.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-medical-primary hover:underline flex items-center gap-1"
                >
                  FinnKode (Norwegian Code Browser) <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://www.ehelse.no/kodeverk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-medical-primary hover:underline flex items-center gap-1"
                >
                  Norwegian Directorate of eHealth <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://www.helfo.no/regelverk-og-takster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-medical-primary hover:underline flex items-center gap-1"
                >
                  HELFO Rules and Rates <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://www.who.int/standards/classifications/classification-of-diseases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-medical-primary hover:underline flex items-center gap-1"
                >
                  WHO ICD-10 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Scale className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Legal Disclaimer</p>
                  <p>This tool is provided "as is" without any warranties. Code suggestions should be verified with official documentation before use in clinical practice. Users are responsible for ensuring the accuracy of medical coding.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-600 mb-1">Important Notice</p>
                  <p>This is an experimental tool for testing and educational purposes only. Not intended for direct clinical use without proper verification.</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 HELFO-HINT Project. Open source software.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    Source Code
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://github.com/your-repo/issues/new" target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Report Issue
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};