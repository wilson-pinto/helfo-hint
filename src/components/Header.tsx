import { Stethoscope } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-medical-primary text-white p-6 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Stethoscope className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Diagnosis & Service Code Suggestion Tool</h1>
        </div>
        <p className="text-primary-foreground/80 text-lg">
          for Norwegian Healthcare (Trial)
        </p>
      </div>
    </header>
  );
};