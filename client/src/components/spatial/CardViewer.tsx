import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, MessageCircle, Mail, Phone, Video, Share2, User } from "lucide-react";
import type { SiteCard } from "@/lib/siteCatalogue";

interface CardViewerProps {
  card: SiteCard | null;
  onClose: () => void;
  onAskAbout: (card: SiteCard) => void;
  onAction: (action: string, card: SiteCard) => void;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export function CardViewer({ 
  card, 
  onClose, 
  onAskAbout, 
  onAction,
  accentColor = '#ffffff', 
  theme = 'dark' 
}: CardViewerProps) {
  if (!card) return null;
  
  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  const actions = [
    { id: 'ask', icon: MessageCircle, label: 'Ask about this' },
    { id: 'share', icon: Share2, label: 'Share' },
  ];
  
  if (card.type === 'person_card') {
    if (card.email) actions.push({ id: 'email', icon: Mail, label: 'Email' });
    if (card.phone) actions.push({ id: 'call', icon: Phone, label: 'Call' });
  }
  
  if (card.type === 'cta_card') {
    if (card.action === 'video_reply') {
      actions.push({ id: 'video_reply', icon: Video, label: 'Request video' });
    }
    if (card.action === 'email') {
      actions.push({ id: 'email', icon: Mail, label: 'Send message' });
    }
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
        onClick={onClose}
      >
        <div 
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        />
        
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-t-2xl md:rounded-2xl overflow-hidden max-h-[80vh]"
          style={{ 
            background: bgColor,
            border: `1px solid ${borderColor}`,
          }}
          data-testid="card-viewer-modal"
        >
          <div 
            className="flex items-center justify-between p-4"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2">
              {card.type === 'person_card' && <User className="w-4 h-4" style={{ color: accentColor }} />}
              <span className="text-xs uppercase tracking-wide" style={{ color: mutedColor }}>
                {card.type.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: mutedColor }}
              data-testid="card-viewer-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
            {card.type === 'image_card' && card.imageUrl && (
              <img 
                src={card.imageUrl} 
                alt={card.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <h2 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
              {card.title}
            </h2>
            
            <p className="text-sm leading-relaxed mb-4" style={{ color: mutedColor }}>
              {card.summary}
            </p>
            
            {card.type === 'person_card' && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: `${accentColor}10` }}>
                <p className="text-sm font-medium" style={{ color: textColor }}>{card.name}</p>
                <p className="text-xs" style={{ color: mutedColor }}>{card.role}</p>
              </div>
            )}
            
            <a
              href={card.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs mb-6 transition-colors"
              style={{ color: accentColor }}
              data-testid="card-viewer-source-link"
            >
              <ExternalLink className="w-3 h-3" />
              View on {card.source.domain}
            </a>
            
            <div className="grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.id === 'ask') {
                      onAskAbout(card);
                    } else {
                      onAction(action.id, card);
                    }
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: action.id === 'ask' ? accentColor : `${accentColor}15`,
                    color: action.id === 'ask' 
                      ? (accentColor === '#ffffff' ? '#000' : '#fff')
                      : textColor,
                    border: `1px solid ${accentColor}30`,
                  }}
                  data-testid={`card-action-${action.id}`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
