import { Stethoscope } from 'lucide-react';
import Logo from './Logo';

export const Header = () => {
  return (
    <header className="text-medical-primary transition-all duration-200 border-b-2 border-me ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
           <div className='w-56'>
              <Logo />
            </div>
        </div>
      </div>
    </header>
  );
};