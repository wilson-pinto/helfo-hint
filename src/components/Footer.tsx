import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Github, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
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
        
        <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>
            This tool provides suggestions based on Norwegian medical coding systems. 
            Always verify codes with official documentation before use.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};