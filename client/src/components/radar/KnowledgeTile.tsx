import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, User, Star, Video, Phone, Mail, Quote, Lightbulb, ExternalLink, Cloud, Sun, Calendar, MapPin, Globe, Briefcase, Award, MessageCircle, Zap, Book, TrendingUp, Shield, Heart, HelpCircle, Settings, Home, DollarSign, Clock, Users, Target, Sparkles, Rss, Twitter, Facebook, Instagram, Linkedin, Youtube, type LucideIcon } from "lucide-react";
import type { AnyKnowledgeItem, Topic, Page, Person, Proof, Action, Blog, Social } from "@/lib/siteKnowledge";
import { orbitTokens } from "@/lib/designTokens";

type DepthTier = 'A' | 'B' | 'C';

interface KnowledgeTileProps {
  item: AnyKnowledgeItem;
  relevanceScore: number;
  position: { x: number; y: number };
  accentColor?: string;
  zoomLevel?: number;
  lightMode?: boolean;
  depthTier?: DepthTier;
  onSelect?: (item: AnyKnowledgeItem) => void;
}

const typeIcons: Record<string, LucideIcon> = {
  topic: Lightbulb,
  page: FileText,
  person: User,
  proof: Star,
  action: Video,
  blog: Rss,
  social: Globe,
  manufacturer: Briefcase,
  product: Sparkles,
  concept: Book,
  qa: HelpCircle,
  community: Users,
  cta: Zap,
  sponsored: Award,
};

const typeColors: Record<string, string> = orbitTokens.typeAccents;

const socialIcons: Record<string, LucideIcon> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Zap,
  pinterest: Target,
  threads: MessageCircle,
};

const socialColors: Record<string, string> = {
  twitter: '#1DA1F2',
  facebook: '#4267B2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  tiktok: '#000000',
  pinterest: '#E60023',
  threads: '#000000',
};

const categoryIcons: Record<string, LucideIcon> = {
  weather: Cloud,
  forecast: Sun,
  schedule: Calendar,
  location: MapPin,
  web: Globe,
  business: Briefcase,
  success: Award,
  contact: MessageCircle,
  action: Zap,
  learn: Book,
  growth: TrendingUp,
  security: Shield,
  health: Heart,
  help: HelpCircle,
  settings: Settings,
  home: Home,
  finance: DollarSign,
  time: Clock,
  team: Users,
  goal: Target,
  feature: Sparkles,
  call: Phone,
  email: Mail,
  video: Video,
  quote: Quote,
};

const typeImageQueries: Record<string, string[]> = {
  topic: ['abstract gradient', 'technology pattern', 'digital network', 'data visualization', 'modern design', 'innovation concept', 'futuristic interface', 'geometric shapes', 'creative pattern', 'minimal abstract'],
  page: ['website design', 'document layout', 'content interface', 'digital screen', 'modern webpage', 'information display', 'clean interface', 'web application', 'dashboard design', 'article layout'],
  person: ['professional headshot', 'business portrait', 'team collaboration', 'office meeting', 'consultant expert', 'corporate professional', 'leadership portrait', 'business handshake', 'workplace team', 'executive portrait'],
  proof: ['success celebration', 'achievement trophy', 'growth chart', 'business results', 'milestone award', 'analytics dashboard', 'performance metrics', 'victory celebration', 'quality certification', 'excellence badge'],
  action: ['action button', 'call to action', 'contact form', 'schedule calendar', 'video conference', 'phone call', 'email inbox', 'booking appointment', 'quick response', 'instant message'],
  blog: ['blog article', 'writing desk', 'content creation', 'news article', 'publishing media', 'editorial content', 'newsletter design', 'journal writing', 'story telling', 'media content'],
  social: ['social media', 'digital marketing', 'online community', 'social network', 'viral content', 'engagement metrics', 'follower growth', 'influencer marketing', 'brand presence', 'social sharing'],
  manufacturer: ['brand logo', 'company headquarters', 'tech company', 'corporate building', 'innovation lab', 'manufacturing facility', 'product design', 'technology campus', 'enterprise office', 'brand identity'],
  product: ['smart glasses', 'wearable tech', 'AR device', 'tech gadget', 'electronic device', 'consumer electronics', 'product photography', 'tech hardware', 'digital accessory', 'modern device'],
  concept: ['concept design', 'idea lightbulb', 'innovation thinking', 'creative process', 'abstract concept', 'knowledge learning', 'education diagram', 'understanding visualization', 'conceptual art', 'idea sketch'],
  qa: ['question answer', 'help desk', 'FAQ support', 'customer service', 'knowledge base', 'information guide', 'help center', 'support ticket', 'assistance request', 'inquiry response'],
  community: ['online community', 'user group', 'forum discussion', 'social gathering', 'community members', 'group collaboration', 'networking event', 'team meeting', 'user conference', 'community engagement'],
  cta: ['call to action', 'button click', 'sign up form', 'action prompt', 'engagement button', 'subscribe now', 'get started', 'join community', 'take action', 'click here'],
  sponsored: ['advertisement', 'sponsored content', 'promotional banner', 'marketing campaign', 'brand promotion', 'advertising media', 'commercial content', 'featured product', 'promotional offer', 'brand partnership'],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getDeterministicGradient(id: string, baseColor: string): string {
  const hash = hashString(id);
  const hueShift = (hash % 30) - 15;
  const satShift = (hash % 20) - 10;
  
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  };
  
  const [h, s, l] = hexToHsl(baseColor);
  const h1 = (h + hueShift + 360) % 360;
  const h2 = (h + hueShift + 30 + 360) % 360;
  const s1 = Math.max(20, Math.min(80, s + satShift));
  
  return `linear-gradient(135deg, hsl(${h1}, ${s1}%, ${l + 10}%) 0%, hsl(${h2}, ${s1 - 10}%, ${l - 5}%) 100%)`;
}

function getOfficialImageUrl(item: AnyKnowledgeItem): string | null {
  if ('imageUrl' in item && (item as any).imageUrl) {
    return (item as any).imageUrl;
  }
  if (item.type === 'product') {
    const product = item as import('@/lib/siteKnowledge').Product;
    if (product.manufacturerLogoUrl) {
      return product.manufacturerLogoUrl;
    }
  }
  if (item.type === 'manufacturer') {
    const manufacturer = item as import('@/lib/siteKnowledge').Manufacturer;
    if (manufacturer.logoUrl) {
      return manufacturer.logoUrl;
    }
  }
  return null;
}

function getCategoryIcon(item: AnyKnowledgeItem): LucideIcon {
  const keywords = item.keywords.map(k => k.toLowerCase());
  for (const keyword of keywords) {
    for (const [category, icon] of Object.entries(categoryIcons)) {
      if (keyword.includes(category) || category.includes(keyword)) {
        return icon;
      }
    }
  }
  if (item.type === 'action') {
    const action = item as Action;
    if (action.actionType === 'call') return Phone;
    if (action.actionType === 'email') return Mail;
    if (action.actionType === 'video_reply') return Video;
  }
  return typeIcons[item.type];
}

function getActionIcon(actionType: string) {
  switch (actionType) {
    case 'video_reply': return Video;
    case 'call': return Phone;
    case 'email': return Mail;
    default: return ExternalLink;
  }
}

const tierStyles = {
  A: { opacity: 0.75, textOpacity: 0.9, summaryOpacity: 0.7, blur: 0, showSummary: true },
  B: { opacity: 0.55, textOpacity: 0.7, summaryOpacity: 0.45, blur: 0, showSummary: true },
  C: { opacity: 0.35, textOpacity: 0.5, summaryOpacity: 0.25, blur: 1, showSummary: false },
};

export function KnowledgeTile({ item, relevanceScore, position, accentColor, zoomLevel = 1, lightMode = false, depthTier = 'A', onSelect }: KnowledgeTileProps) {
  const shouldReduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);
  const CategoryIcon = getCategoryIcon(item);
  const tierStyle = tierStyles[depthTier];
  
  const handleClick = () => {
    console.log('[KnowledgeTile] Click fired for:', item.id, item.type);
    if (onSelect) {
      onSelect(item);
    }
  };
  
  const getTypeIcon = (): LucideIcon => {
    if (item.type === 'action') return getActionIcon((item as Action).actionType);
    if (item.type === 'social') return socialIcons[(item as Social).platform] || Globe;
    return typeIcons[item.type] || Globe;
  };
  const TypeIcon = getTypeIcon();
  
  const getColor = (): string => {
    // Industry orbit tiles always use type-specific colors for visual hierarchy
    const industryTypes = ['manufacturer', 'product', 'concept', 'qa', 'community', 'cta', 'sponsored'];
    if (industryTypes.includes(item.type)) {
      return typeColors[item.type] || '#3b82f6';
    }
    return accentColor || typeColors[item.type] || '#3b82f6';
  };
  const color = getColor();
  const glowIntensity = Math.min(relevanceScore / 30, 1);
  
  const officialImageUrl = getOfficialImageUrl(item);
  
  const enhanceImageUrl = (url: string): string => {
    if (!url) return url;
    const wpEnhanced = url.replace(/-\d+x\d+(_c)?(\.[a-z]+)$/i, '$2');
    if (wpEnhanced !== url) return wpEnhanced;
    const sqEnhanced = url.replace(/\/s\/\d+x\d+\//, '/s/');
    if (sqEnhanced !== url) return sqEnhanced;
    return url;
  };
  
  const imageUrl = officialImageUrl ? enhanceImageUrl(officialImageUrl) : null;
  const hasOfficialImage = !!imageUrl && !imageError;
  const placeholderGradient = getDeterministicGradient(item.id, color);
  
  const getInitials = (): string => {
    if (item.type === 'manufacturer') {
      return (item as import('@/lib/siteKnowledge').Manufacturer).initials;
    }
    if (item.type === 'product') {
      return (item as import('@/lib/siteKnowledge').Product).manufacturerInitials;
    }
    const label = getLabel() || item.type;
    return label?.split(/\s+/).map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('') || item.type[0].toUpperCase();
  };
  
  const getLabel = () => {
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
      case 'manufacturer': return (item as import('@/lib/siteKnowledge').Manufacturer).name;
      case 'product': return (item as import('@/lib/siteKnowledge').Product).name;
      case 'concept': return (item as import('@/lib/siteKnowledge').Concept).label;
      case 'qa': return (item as import('@/lib/siteKnowledge').QA).question;
      case 'community': return (item as import('@/lib/siteKnowledge').Community).name;
      case 'cta': return (item as import('@/lib/siteKnowledge').CTA).label;
      case 'sponsored': return (item as import('@/lib/siteKnowledge').Sponsored).name;
      default: return 'Unknown';
    }
  };

  const getSummary = () => {
    switch (item.type) {
      case 'topic': return (item as Topic).summary;
      case 'page': return (item as Page).summary;
      case 'person': return (item as Person).role;
      case 'proof': return (item as Proof).summary;
      case 'action': return (item as Action).summary;
      case 'blog': return (item as Blog).summary;
      case 'social': {
        const social = item as Social;
        if (!social.connected) return 'Connect to show feed';
        return social.followerCount ? `${social.followerCount.toLocaleString()} followers` : 'View feed';
      }
      case 'manufacturer': {
        const mfr = item as import('@/lib/siteKnowledge').Manufacturer;
        return mfr.productCount > 0 ? `${mfr.productCount} product${mfr.productCount === 1 ? '' : 's'}` : 'Manufacturer';
      }
      case 'product': {
        const prod = item as import('@/lib/siteKnowledge').Product;
        let summary = prod.summary || prod.category || 'Product';
        if (prod.releaseDate) {
          const date = new Date(prod.releaseDate);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          summary = `${dateStr} · ${summary}`;
        }
        return summary;
      }
      case 'concept': {
        const concept = item as import('@/lib/siteKnowledge').Concept;
        return concept.whyItMatters || 'Learn more';
      }
      case 'qa': {
        const qa = item as import('@/lib/siteKnowledge').QA;
        return qa.sublabel || 'Tap to see answer';
      }
      case 'community': {
        const community = item as import('@/lib/siteKnowledge').Community;
        if (community.notes) return community.notes;
        return community.communityType?.replace('_', ' ') || 'Community';
      }
      case 'cta': {
        const cta = item as import('@/lib/siteKnowledge').CTA;
        return cta.summary || 'Take action';
      }
      case 'sponsored': {
        const sponsored = item as import('@/lib/siteKnowledge').Sponsored;
        return sponsored.summary || 'Sponsored';
      }
      default: return '';
    }
  };

  const tileWidth = 200;
  const tileHeight = 90;
  
  const hash = hashString(item.id);
  const driftX = Math.sin(hash * 0.1) * 4;
  const driftY = Math.cos(hash * 0.1) * 3;
  const driftDuration = 10 + (hash % 6);
  const microRotation = ((hash % 100) - 50) * 0.02;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9, rotate: 0 }}
      animate={{ 
        opacity: tierStyle.opacity, 
        scale: 1,
        rotate: shouldReduceMotion ? 0 : [microRotation, -microRotation, microRotation],
        x: shouldReduceMotion ? position.x : [position.x - driftX, position.x + driftX, position.x - driftX],
        y: shouldReduceMotion ? position.y : [position.y - driftY, position.y + driftY, position.y - driftY],
      }}
      transition={shouldReduceMotion ? { duration: 0 } : { 
        x: { repeat: Infinity, duration: driftDuration, ease: "easeInOut" },
        y: { repeat: Infinity, duration: driftDuration * 1.15, ease: "easeInOut" },
        rotate: { repeat: Infinity, duration: driftDuration * 1.3, ease: "easeInOut" },
        opacity: { duration: 0.5 },
        scale: { type: 'spring', stiffness: 80, damping: 18 }
      }}
      whileHover={shouldReduceMotion ? {} : { 
        opacity: 1,
        scale: 1.06,
        rotate: 0,
        filter: 'blur(0px)',
        zIndex: 50,
        transition: { duration: 0.25 }
      }}
      whileTap={shouldReduceMotion ? {} : { 
        scale: 0.97,
        transition: { duration: 0.1 }
      }}
      className="absolute rounded-xl text-left overflow-hidden group"
      style={{
        width: tileWidth,
        height: tileHeight,
        background: lightMode 
          ? `linear-gradient(135deg, rgba(255,255,255,${0.7 + tierStyle.opacity * 0.3}) 0%, rgba(255,255,255,${0.6 + tierStyle.opacity * 0.3}) 100%)`
          : `linear-gradient(135deg, rgba(18,18,22,${0.6 + tierStyle.opacity * 0.3}) 0%, rgba(18,18,22,${0.5 + tierStyle.opacity * 0.3}) 100%)`,
        backdropFilter: `blur(${6 + tierStyle.blur}px)`,
        filter: tierStyle.blur > 0 ? `blur(${tierStyle.blur}px)` : undefined,
        borderLeft: `3px solid ${color}${Math.round(tierStyle.opacity * 80).toString(16).padStart(2, '0')}`,
        borderTop: `1px solid ${lightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'}`,
        borderRight: `1px solid ${lightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'}`,
        borderBottom: `1px solid ${lightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.01)'}`,
        boxShadow: `0 4px 20px rgba(0,0,0,${0.08 + tierStyle.opacity * 0.1})`,
        left: '50%',
        top: '50%',
        marginLeft: -tileWidth / 2,
        marginTop: -tileHeight / 2,
        cursor: 'pointer',
      }}
      onClick={handleClick}
      data-tile-id={item.id}
      data-testid={`tile-${item.id}`}
      data-tier={depthTier}
    >
      <div className="p-3 h-full flex flex-col justify-between relative z-10">
        <div className="flex items-start gap-2.5">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
            style={{ 
              backgroundColor: `${color}${Math.round(tierStyle.textOpacity * 20).toString(16).padStart(2, '0')}`,
              border: `1px solid ${color}${Math.round(tierStyle.textOpacity * 30).toString(16).padStart(2, '0')}`,
            }}
            title={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          >
            <TypeIcon 
              className="w-3.5 h-3.5 group-hover:opacity-100 transition-opacity" 
              style={{ color, opacity: tierStyle.textOpacity * 0.9 }} 
            />
          </div>
          
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p 
                className={`text-sm font-medium leading-snug line-clamp-2 transition-all group-hover:opacity-100 ${lightMode ? 'text-gray-800 group-hover:text-gray-900' : 'group-hover:text-white'}`}
                style={{ opacity: tierStyle.textOpacity, color: lightMode ? undefined : `rgba(255,255,255,${tierStyle.textOpacity})` }}
              >
                {getLabel()}
              </p>
            </div>
            
            {hasOfficialImage && imageUrl && (
              <div 
                className="w-9 h-9 rounded-md overflow-hidden shrink-0 border group-hover:opacity-100 transition-opacity"
                style={{ borderColor: `${color}20`, opacity: tierStyle.textOpacity }}
              >
                <img
                  src={imageUrl}
                  alt=""
                  loading="lazy"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        
        {tierStyle.showSummary && (
          <p 
            className={`text-xs leading-relaxed line-clamp-2 transition-all group-hover:opacity-80 ${lightMode ? 'text-gray-500 group-hover:text-gray-600' : 'group-hover:text-white/70'}`}
            style={{ opacity: tierStyle.summaryOpacity, color: lightMode ? undefined : `rgba(255,255,255,${tierStyle.summaryOpacity})` }}
          >
            {getSummary()}
          </p>
        )}
      </div>
      
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
        style={{ 
          boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}40`,
          background: lightMode 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
        }}
      />
    </motion.div>
  );
}
