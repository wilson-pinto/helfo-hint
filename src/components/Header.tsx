import { Stethoscope } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-medical-primary text-white shadow-lg transition-all duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Diagnosis & Service Code Suggestion Tool
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-sm sm:text-base lg:text-lg sm:ml-auto">
            for Norwegian Healthcare (Trial)
          </p>
        </div>
      </div>
    </header>
  );
};