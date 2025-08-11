import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Book, Scale, ExternalLink, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export const Footer = () => {
  return (
    <motion.div
      className='container mx-auto px-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mt-8 bg-transparent text-gray-400">
        <CardContent className="p-6">
          <div className="flex my-8">
            <div className='w-56'>
              <Logo />
            </div>
          </div>

          <div className="grid gap-6">
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

            <div className="space-y-3 text-sm">
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <p>© 2025 HELFO-HINT Project.</p>
              <p className="flex items-center gap-1 mt-1">
                Made with <Heart className="h-3 w-3 text-medical-error dark:text-medical-error-foreground fill-current animate-pulse" /> by AI Alchemists
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
