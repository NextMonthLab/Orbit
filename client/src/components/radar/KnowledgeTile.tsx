import { motion } from "framer-motion";
import { FileText, User, Star, Video, Phone, Mail, Quote, Lightbulb, ExternalLink } from "lucide-react";
import type { AnyKnowledgeItem, Topic, Page, Person, Proof, Action } from "@/lib/siteKnowledge";

interface KnowledgeTileProps {
  item: AnyKnowledgeItem;
  relevanceScore: number;
  position: { x: number; y: number };
  onClick: (item: AnyKnowledgeItem) => void;
  accentColor?: string;
  zoomLevel?: number;
}

const typeIcons = {
  topic: Lightbulb,
  page: FileText,
  person: User,
  proof: Star,
  action: Video,
};

const typeColors = {
  topic: '#8b5cf6',
  page: '#3b82f6',
  person: '#22c55e',
  proof: '#eab308',
  action: '#ec4899',
};

const typeImageKeywords = {
  topic: ['abstract', 'technology', 'innovation', 'digital', 'concept', 'data', 'network', 'science', 'research', 'future'],
  page: ['document', 'website', 'interface', 'screen', 'content', 'article', 'blog', 'news', 'media', 'information'],
  person: ['professional', 'portrait', 'business', 'team', 'office', 'meeting', 'collaboration', 'handshake', 'consultant', 'expert'],
  proof: ['success', 'achievement', 'trophy', 'chart', 'growth', 'celebration', 'award', 'milestone', 'results', 'analytics'],
  action: ['action', 'click', 'phone', 'email', 'contact', 'schedule', 'calendar', 'video', 'call', 'message'],
};

function generateTileImage(item: AnyKnowledgeItem): string {
  const baseKeywords = typeImageKeywords[item.type];
  const itemKeyword = item.keywords[0] || baseKeywords[0];
  const hashCode = item.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  const typeKeyword = baseKeywords[Math.abs(hashCode) % baseKeywords.length];
  const query = encodeURIComponent(`${itemKeyword} ${typeKeyword}`);
  const seed = Math.abs(hashCode) % 1000;
  return `https://source.unsplash.com/200x120/?${query}&sig=${seed}`;
}

function getActionIcon(actionType: string) {
  switch (actionType) {
    case 'video_reply': return Video;
    case 'call': return Phone;
    case 'email': return Mail;
    default: return ExternalLink;
  }
}

export function KnowledgeTile({ item, relevanceScore, position, onClick, accentColor, zoomLevel = 1 }: KnowledgeTileProps) {
  const Icon = item.type === 'action' 
    ? getActionIcon((item as Action).actionType)
    : typeIcons[item.type];
  
  const color = accentColor || typeColors[item.type];
  const glowIntensity = Math.min(relevanceScore / 30, 1);
  
  const showDetails = true;
  const showSummary = true;
  const showFullContent = zoomLevel >= 1.2;
  
  const rawImageUrl = 'imageUrl' in item ? (item as any).imageUrl : undefined;
  const imageUrl = rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.length > 0 
    ? rawImageUrl 
    : generateTileImage(item);
  
  const getLabel = () => {
    switch (item.type) {
      case 'topic': return (item as Topic).label;
      case 'page': return (item as Page).title;
      case 'person': return (item as Person).name;
      case 'proof': return (item as Proof).label;
      case 'action': return (item as Action).label;
    }
  };

  const getSummary = () => {
    switch (item.type) {
      case 'topic': return (item as Topic).summary;
      case 'page': return (item as Page).summary;
      case 'person': return (item as Person).role;
      case 'proof': return (item as Proof).summary;
      case 'action': return (item as Action).summary;
    }
  };

  const tileWidth = 95;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 120, 
        damping: 20,
        opacity: { duration: 0.3 }
      }}
      whileHover={{ scale: 1.05, zIndex: 100 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className="absolute rounded-xl text-left overflow-hidden"
      style={{
        width: tileWidth,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${color}${Math.floor(30 + glowIntensity * 40).toString(16)}`,
        boxShadow: glowIntensity > 0.2 
          ? `0 0 ${20 + glowIntensity * 40}px ${color}${Math.floor(glowIntensity * 50).toString(16)}, 0 4px 20px rgba(0,0,0,0.4)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        left: '50%',
        top: '50%',
        marginLeft: -tileWidth / 2,
        marginTop: '-60px',
      }}
      data-tile
      data-testid={`tile-${item.id}`}
    >
      {/* Image header or gradient placeholder */}
      <div 
        className="w-full h-12 bg-cover bg-center"
        style={{ 
          backgroundImage: imageUrl 
            ? `url(${imageUrl})` 
            : `linear-gradient(135deg, ${color}40 0%, ${color}15 100%)`,
          borderBottom: `1px solid ${color}25`,
        }}
      />
      
      {/* Content */}
      <div className="p-2">
        {/* Relevance indicator */}
        {relevanceScore > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        )}
        
        <div className="flex items-start gap-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium leading-tight line-clamp-2">
              {getLabel()}
            </p>
            <p className="text-white/50 text-[10px] line-clamp-2 mt-1 leading-tight">
              {getSummary()}
            </p>
          </div>
        </div>
        
        {/* Type badge - always show */}
        <div 
          className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {item.type}
        </div>
      </div>
    </motion.button>
  );
}
