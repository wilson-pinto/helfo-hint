import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setScreen } from '@/store/slices/medicalSlice';
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ClipboardCheck } from 'lucide-react';
import { TScreen } from '@/types';
import Logo from './Logo';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const dispatch = useAppDispatch();
  const currentScreen = useAppSelector((state) => state.medical.currentScreen);

  const handleScreenChange = (screen: TScreen) => {
    dispatch(setScreen(screen));
  };

  return (
    <div className="min-h-screen bg-medical-primary/10">
      <header className="bg-white border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto py-4">
          <div className="flex gap-4 justify-between">
            <div className='w-56 text-medical-primary'>
              <Logo />
            </div>
            <Tabs
              value={currentScreen}
              onValueChange={(value) => handleScreenChange(value as TScreen)}
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger
                  value="code-guessing"
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Code Guessing
                </TabsTrigger>
                <TabsTrigger
                  value="code-validation"
                  className="flex items-center gap-2"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Code Validation
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className=''>
              {children}
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/50 py-4 mt-8 bg-black/85">
       <Footer />
      </footer>
    </div>
  );
};