import { motion } from "framer-motion";
import { ExternalLink, MessageCircle, Mail, Phone, Video, Calendar, User } from "lucide-react";
import type { SiteCard } from "@/lib/siteCatalogue";

interface SpatialCardProps {
  card: SiteCard;
  onClick: (card: SiteCard) => void;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export function SpatialCard({ card, onClick, accentColor = '#ffffff', theme = 'dark' }: SpatialCardProps) {
  const bgColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  
  const getCardIcon = () => {
    switch (card.type) {
      case 'person_card':
        return <User className="w-4 h-4" />;
      case 'cta_card':
        if (card.action === 'email') return <Mail className="w-4 h-4" />;
        if (card.action === 'call') return <Phone className="w-4 h-4" />;
        if (card.action === 'video_reply' || card.action === 'video_call') return <Video className="w-4 h-4" />;
        if (card.action === 'book') return <Calendar className="w-4 h-4" />;
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-3 h-3" />;
    }
  };
  
  const isCtaCard = card.type === 'cta_card';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(card)}
      className="flex-shrink-0 w-64 cursor-pointer rounded-xl overflow-hidden"
      style={{ 
        background: isCtaCard ? `${accentColor}15` : bgColor,
        border: `1.5px solid ${isCtaCard ? `${accentColor}40` : borderColor}`,
      }}
      data-testid={`spatial-card-${card.id}`}
    >
      {card.type === 'image_card' && card.imageUrl && (
        <div className="h-32 overflow-hidden">
          <img 
            src={card.imageUrl} 
            alt={card.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 
            className="font-medium text-sm line-clamp-2 flex-1"
            style={{ color: textColor }}
          >
            {card.title}
          </h3>
          <div 
            className="flex-shrink-0 p-1.5 rounded-md"
            style={{ 
              background: isCtaCard ? accentColor : 'transparent',
              color: isCtaCard ? (accentColor === '#ffffff' ? '#000' : '#fff') : mutedColor
            }}
          >
            {getCardIcon()}
          </div>
        </div>
        
        <p 
          className="text-xs line-clamp-2 mb-3"
          style={{ color: mutedColor }}
        >
          {card.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <span 
            className="text-[10px] uppercase tracking-wide"
            style={{ color: mutedColor }}
          >
            From {card.source.domain}
          </span>
          {card.signals.confidence >= 0.8 && (
            <span 
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ 
                background: `${accentColor}20`,
                color: accentColor === '#ffffff' ? textColor : accentColor
              }}
            >
              Relevant
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
