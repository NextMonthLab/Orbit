import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OrbitSuggestion {
  id: number;
  suggestionType: string;
  priority: string;
  title: string;
  description: string;
  actionPrompt?: string;
}

interface SuggestionPromptProps {
  suggestion: OrbitSuggestion;
  orbitSlug: string;
  onAccept?: (actionPrompt?: string) => void;
  onDismiss?: () => void;
  className?: string;
}

export function SuggestionPrompt({ 
  suggestion, 
  orbitSlug, 
  onAccept, 
  onDismiss,
  className 
}: SuggestionPromptProps) {
  const [isResponding, setIsResponding] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    setIsResponding(true);
    try {
      await apiRequest(
        'PATCH',
        `/api/orbit/${orbitSlug}/suggestions/${suggestion.id}`,
        { ownerResponse: 'accepted' }
      );
      
      if (onAccept) {
        onAccept(suggestion.actionPrompt);
      }
      
      toast({
        title: "Got it",
        description: "Let's work on this together."
      });
      
      setIsDismissed(true);
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleDismiss = async () => {
    setIsResponding(true);
    try {
      await apiRequest(
        'PATCH',
        `/api/orbit/${orbitSlug}/suggestions/${suggestion.id}`,
        { ownerResponse: 'dismissed' }
      );
      
      if (onDismiss) {
        onDismiss();
      }
      
      setIsDismissed(true);
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    } finally {
      setIsResponding(false);
    }
  };

  const handleLater = async () => {
    setIsResponding(true);
    try {
      await apiRequest(
        'PATCH',
        `/api/orbit/${orbitSlug}/suggestions/${suggestion.id}`,
        { ownerResponse: 'later' }
      );
      
      toast({
        title: "No problem",
        description: "I'll bring this up another time."
      });
      
      setIsDismissed(true);
    } catch (error) {
      console.error('Error deferring suggestion:', error);
    } finally {
      setIsResponding(false);
    }
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "bg-amber-500/10 border border-amber-500/20 rounded-lg p-3",
          className
        )}
        data-testid="suggestion-prompt"
      >
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/90 font-medium">
              {suggestion.title}
            </p>
            <p className="text-xs text-foreground/60 mt-1">
              {suggestion.description}
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAccept}
                disabled={isResponding}
                className="h-7 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300"
                data-testid="button-accept-suggestion"
              >
                <Check className="w-3 h-3 mr-1" />
                Help me with this
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLater}
                disabled={isResponding}
                className="h-7 text-xs text-foreground/50 hover:text-foreground/70"
                data-testid="button-later-suggestion"
              >
                <Clock className="w-3 h-3 mr-1" />
                Later
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                disabled={isResponding}
                className="h-7 text-xs text-foreground/40 hover:text-foreground/60 ml-auto"
                data-testid="button-dismiss-suggestion"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface SuggestionListProps {
  suggestions: OrbitSuggestion[];
  orbitSlug: string;
  onAccept?: (actionPrompt?: string) => void;
  maxVisible?: number;
  className?: string;
}

export function SuggestionList({ 
  suggestions, 
  orbitSlug, 
  onAccept,
  maxVisible = 2,
  className 
}: SuggestionListProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const visibleSuggestions = suggestions
    .filter(s => !dismissedIds.has(s.id))
    .slice(0, maxVisible);

  if (visibleSuggestions.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {visibleSuggestions.map(suggestion => (
        <SuggestionPrompt
          key={suggestion.id}
          suggestion={suggestion}
          orbitSlug={orbitSlug}
          onAccept={onAccept}
          onDismiss={() => setDismissedIds(prev => new Set(Array.from(prev).concat(suggestion.id)))}
        />
      ))}
    </div>
  );
}
