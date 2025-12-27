import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardPlayer from "@/components/CardPlayer";
import { adaptPreviewToCards, getTargetsFromIdentity, PreviewTarget } from "./PreviewCardAdapter";
import { ChevronRight, MessageCircle } from "lucide-react";

interface SiteIdentity {
  sourceDomain: string;
  title: string | null;
  heroHeadline: string | null;
  heroDescription: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  heroImageUrl: string | null;
  primaryColour: string;
  serviceHeadings: string[];
  serviceBullets: string[];
  faqCandidates: string[];
}

interface PreviewExperienceOrchestratorProps {
  siteIdentity: SiteIdentity;
  siteTitle: string | null;
  siteSummary: string | null;
  onAskAbout: (prompt: string) => void;
  onClaim: () => void;
}

type Mode = 'cinematic' | 'interactive' | 'transitioning';

export function PreviewExperienceOrchestrator({
  siteIdentity,
  siteTitle,
  onAskAbout,
  onClaim,
}: PreviewExperienceOrchestratorProps) {
  const [mode, setMode] = useState<Mode>('cinematic');
  const [currentTarget, setCurrentTarget] = useState<PreviewTarget>({ type: 'overview', id: 'overview' });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const primaryColour = siteIdentity.primaryColour || '#7c3aed';
  const targets = getTargetsFromIdentity(siteIdentity);
  const cards = adaptPreviewToCards(siteIdentity, siteTitle, currentTarget);
  const currentCard = cards[0];

  const handlePhaseChange = useCallback((phase: "cinematic" | "context") => {
    if (phase === 'context') {
      setMode('interactive');
    }
  }, []);

  const handleTargetClick = useCallback((target: PreviewTarget) => {
    if (target.id === currentTarget.id) return;

    setIsTransitioning(true);
    setMode('transitioning');

    setTimeout(() => {
      setCurrentTarget(target);
      setMode('cinematic');
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 250);
  }, [currentTarget.id]);

  const handleAskAbout = useCallback((target: PreviewTarget) => {
    const prompt = target.type === 'faq' 
      ? target.label || 'Tell me more'
      : target.type === 'service'
      ? `What does ${target.label} include?`
      : target.type === 'why'
      ? 'What makes you different?'
      : target.type === 'lead'
      ? 'How do I get started?'
      : `Tell me about ${siteIdentity.sourceDomain}`;
    
    onAskAbout(prompt);
  }, [siteIdentity.sourceDomain, onAskAbout]);

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-50 bg-black"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mode === 'cinematic' && currentCard && (
          <motion.div
            key={`cinematic-${currentTarget.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[70vh] min-h-[400px] max-h-[600px]"
          >
            <CardPlayer
              card={currentCard}
              autoplay={true}
              onPhaseChange={handlePhaseChange}
              fullScreen={false}
            />
          </motion.div>
        )}

        {mode === 'interactive' && (
          <motion.div
            key={`interactive-${currentTarget.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="p-4 border-b border-border bg-card/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {currentTarget.label || 'Overview'}
                </h2>
                <button
                  onClick={() => handleAskAbout(currentTarget)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  data-testid="button-ask-current"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask about this
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {targets.filter(t => t.id !== currentTarget.id).slice(0, 6).map((target) => (
                <button
                  key={target.id}
                  onClick={() => handleTargetClick(target)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-accent/10 hover:border-primary/30 transition-all group flex items-center justify-between"
                  style={{
                    borderLeftColor: primaryColour,
                    borderLeftWidth: '3px',
                  }}
                  data-testid={`target-${target.id}`}
                >
                  <div className="flex-1">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                      {target.type === 'service' ? 'Service' : target.type === 'faq' ? 'Question' : target.type === 'lead' ? 'Next Step' : target.type}
                    </span>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {target.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            {currentTarget.type === 'lead' && (
              <div className="p-4 pt-0">
                <button
                  onClick={onClaim}
                  className="w-full p-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
                  data-testid="button-claim-orchestrator"
                >
                  Claim and activate
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
