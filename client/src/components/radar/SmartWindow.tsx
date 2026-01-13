import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, FileText, User, Star, Globe, Briefcase, Award, MessageCircle, Zap, Book, HelpCircle, Rss, type LucideIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AnyKnowledgeItem, Topic, Page, Person, Proof, Action, Blog, Social } from "@/lib/siteKnowledge";
import { orbitTokens } from "@/lib/designTokens";

interface SmartWindowProps {
  item: AnyKnowledgeItem | null;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
  lightMode?: boolean;
}

const typeIcons: Record<string, LucideIcon> = {
  topic: Lightbulb,
  page: FileText,
  person: User,
  proof: Star,
  action: Zap,
  blog: Rss,
  social: Globe,
  manufacturer: Briefcase,
  product: Award,
  concept: Book,
  qa: HelpCircle,
  community: MessageCircle,
  cta: Zap,
  sponsored: Award,
};

const typeColors: Record<string, string> = orbitTokens.typeAccents;

function getLabel(item: AnyKnowledgeItem): string {
  switch (item.type) {
    case 'topic': return (item as Topic).label;
    case 'page': return (item as Page).title;
    case 'person': return (item as Person).name;
    case 'proof': return (item as Proof).label;
    case 'action': return (item as Action).label;
    case 'blog': return (item as Blog).title;
    case 'social': {
      const social = item as Social;
      return social.connected ? `@${social.handle}` : social.platform.charAt(0).toUpperCase() + social.platform.slice(1);
    }
    case 'manufacturer': return (item as any).name;
    case 'product': return (item as any).name;
    case 'concept': return (item as any).label;
    case 'qa': return (item as any).question;
    case 'community': return (item as any).name;
    case 'cta': return (item as any).label;
    case 'sponsored': return (item as any).name;
    default: return 'Unknown';
  }
}

function getSummary(item: AnyKnowledgeItem): string {
  switch (item.type) {
    case 'topic': return (item as Topic).summary;
    case 'page': return (item as Page).summary;
    case 'person': return (item as Person).role;
    case 'proof': return (item as Proof).summary;
    case 'action': return (item as Action).summary;
    case 'blog': return (item as Blog).summary;
    case 'social': {
      const social = item as Social;
      return social.connected ? (social.followerCount ? `${social.followerCount.toLocaleString()} followers` : 'View feed') : 'Connect to show feed';
    }
    case 'manufacturer': return `${(item as any).productCount} products`;
    case 'product': return (item as any).summary || (item as any).category || 'Product';
    case 'concept': return (item as any).whyItMatters || 'Learn more';
    case 'qa': return (item as any).sublabel || '';
    case 'community': return (item as any).notes || (item as any).communityType || 'Community';
    case 'cta': return (item as any).summary;
    case 'sponsored': return (item as any).summary || 'Sponsored';
    default: return '';
  }
}

export function SmartWindow({ item, isOpen, onClose, accentColor = '#3b82f6', lightMode = false }: SmartWindowProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !item) return null;

  const color = typeColors[item.type] || accentColor;
  const TypeIcon = typeIcons[item.type] || Globe;
  const label = getLabel(item);
  const summary = getSummary(item);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="h-full flex flex-col"
          style={{
            width: 400,
            minWidth: 400,
            backgroundColor: lightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(20, 20, 26, 0.98)',
            borderLeft: `1px solid ${lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
          }}
          data-testid="smart-window"
        >
          <div 
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: `1px solid ${lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ 
                  backgroundColor: `${color}20`,
                  border: `1px solid ${color}30`,
                }}
              >
                <TypeIcon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="min-w-0">
                <span 
                  className="text-[10px] font-medium uppercase tracking-wider block"
                  style={{ color }}
                >
                  {item.type}
                </span>
                <h2 className={`text-sm font-semibold leading-tight truncate ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                  {label}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                lightMode ? 'hover:bg-black/5 text-gray-500' : 'hover:bg-white/10 text-white/60'
              }`}
              data-testid="smart-window-close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              <section data-testid="smart-window-summary">
                <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${lightMode ? 'text-gray-500' : 'text-white/50'}`}>
                  Summary
                </h3>
                <p className={`text-sm leading-relaxed ${lightMode ? 'text-gray-700' : 'text-white/80'}`}>
                  {summary || 'No summary available.'}
                </p>
              </section>

              {item.keywords && item.keywords.length > 0 && (
                <section data-testid="smart-window-tags">
                  <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${lightMode ? 'text-gray-500' : 'text-white/50'}`}>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords.map((keyword, i) => (
                      <span 
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded ${lightMode ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/70'}`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section data-testid="smart-window-source">
                <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${lightMode ? 'text-gray-500' : 'text-white/50'}`}>
                  Source
                </h3>
                <div 
                  className={`h-40 rounded-lg border flex items-center justify-center ${
                    lightMode ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`text-xs ${lightMode ? 'text-gray-400' : 'text-white/30'}`}>
                    Source content will load here
                  </span>
                </div>
              </section>

              <section data-testid="smart-window-comparison">
                <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${lightMode ? 'text-gray-500' : 'text-white/50'}`}>
                  Comparison
                </h3>
                <div 
                  className={`h-24 rounded-lg border flex items-center justify-center ${
                    lightMode ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`text-xs ${lightMode ? 'text-gray-400' : 'text-white/30'}`}>
                    Comparison data will load here
                  </span>
                </div>
              </section>
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
