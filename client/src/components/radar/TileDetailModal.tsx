import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Phone, Mail, Video, Lightbulb, FileText, User, Star, Globe, Briefcase, Award, MessageCircle, Zap, Book, TrendingUp, Shield, Heart, HelpCircle, Rss, Twitter, Facebook, Instagram, Linkedin, Youtube, type LucideIcon } from "lucide-react";
import type { AnyKnowledgeItem, Topic, Page, Person, Proof, Action, Blog, Social } from "@/lib/siteKnowledge";
import { orbitTokens } from "@/lib/designTokens";

interface TileDetailModalProps {
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

const socialIcons: Record<string, LucideIcon> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
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
    case 'qa': return (item as any).answer || (item as any).sublabel || '';
    case 'community': return (item as any).notes || (item as any).communityType || 'Community';
    case 'cta': return (item as any).summary;
    case 'sponsored': return (item as any).summary || 'Sponsored';
    default: return '';
  }
}

function getFullContent(item: AnyKnowledgeItem): string | null {
  switch (item.type) {
    case 'qa': return (item as any).answer;
    case 'blog': return (item as any).content || null;
    case 'concept': return (item as any).explanation || null;
    default: return null;
  }
}

function getActionButton(item: AnyKnowledgeItem): { label: string; icon: LucideIcon; href?: string } | null {
  switch (item.type) {
    case 'action': {
      const action = item as any;
      if (action.actionType === 'call' && action.phone) {
        return { label: `Call ${action.phone}`, icon: Phone, href: `tel:${action.phone}` };
      }
      if (action.actionType === 'email' && action.email) {
        return { label: `Email ${action.email}`, icon: Mail, href: `mailto:${action.email}` };
      }
      if (action.actionType === 'video_reply') {
        return { label: 'Record Video Reply', icon: Video };
      }
      return { label: 'Take Action', icon: ExternalLink };
    }
    case 'page': {
      const page = item as Page;
      if (page.url) {
        return { label: 'Visit Page', icon: ExternalLink, href: page.url };
      }
      return null;
    }
    case 'social': {
      const social = item as Social;
      if (social.url) {
        return { label: `View on ${social.platform}`, icon: socialIcons[social.platform] || Globe, href: social.url };
      }
      return null;
    }
    case 'cta': {
      const cta = item as any;
      if (cta.url) {
        return { label: cta.label || 'Take Action', icon: ExternalLink, href: cta.url };
      }
      return null;
    }
    default:
      return null;
  }
}

export function TileDetailModal({ item, isOpen, onClose, accentColor = '#3b82f6', lightMode = false }: TileDetailModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!item) return null;

  const color = typeColors[item.type] || accentColor;
  const TypeIcon = item.type === 'social' 
    ? (socialIcons[(item as Social).platform] || Globe)
    : (typeIcons[item.type] || Globe);
  const label = getLabel(item);
  const summary = getSummary(item);
  const fullContent = getFullContent(item);
  const actionButton = getActionButton(item);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            zIndex: 100,
            backgroundColor: lightMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.7)',
          }}
          onClick={handleBackdropClick}
          data-testid="tile-detail-backdrop"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              backgroundColor: lightMode ? 'rgba(255,255,255,0.98)' : 'rgba(20,20,26,0.98)',
              border: `1px solid ${lightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: `0 0 80px ${color}20, 0 32px 64px -16px rgba(0,0,0,0.5)`,
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="tile-detail-modal"
          >
            <div 
              className="h-2 w-full"
              style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)` }}
            />
            
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                lightMode ? 'hover:bg-black/5 text-gray-500' : 'hover:bg-white/10 text-white/60'
              }`}
              data-testid="tile-detail-close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: `${color}20`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <TypeIcon className="w-6 h-6" style={{ color }} />
                </div>
                
                <div className="flex-1 min-w-0 pr-8">
                  <span 
                    className="text-xs font-medium uppercase tracking-wider mb-1 block"
                    style={{ color }}
                  >
                    {item.type}
                  </span>
                  <h2 className={`text-xl font-semibold leading-tight ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                    {label}
                  </h2>
                </div>
              </div>
              
              <p className={`text-base leading-relaxed mb-4 ${lightMode ? 'text-gray-600' : 'text-white/70'}`}>
                {summary}
              </p>
              
              {fullContent && (
                <div 
                  className={`p-4 rounded-lg mb-4 ${lightMode ? 'bg-gray-50' : 'bg-white/5'}`}
                  style={{ borderLeft: `3px solid ${color}50` }}
                >
                  <p className={`text-sm leading-relaxed ${lightMode ? 'text-gray-700' : 'text-white/80'}`}>
                    {fullContent}
                  </p>
                </div>
              )}
              
              {item.keywords && item.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.keywords.slice(0, 5).map((keyword, i) => (
                    <span 
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full ${lightMode ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/60'}`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              {actionButton && (
                <div className="pt-4 border-t" style={{ borderColor: lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
                  {actionButton.href ? (
                    <a
                      href={actionButton.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: color }}
                      data-testid="tile-detail-cta"
                    >
                      <actionButton.icon className="w-4 h-4" />
                      {actionButton.label}
                    </a>
                  ) : (
                    <button
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: color }}
                      data-testid="tile-detail-cta"
                    >
                      <actionButton.icon className="w-4 h-4" />
                      {actionButton.label}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
