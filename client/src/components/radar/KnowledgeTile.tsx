import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, User, Star, Video, Phone, Mail, Quote, Lightbulb, ExternalLink, Cloud, Sun, Calendar, MapPin, Globe, Briefcase, Award, MessageCircle, Zap, Book, TrendingUp, Shield, Heart, HelpCircle, Settings, Home, DollarSign, Clock, Users, Target, Sparkles, Rss, Twitter, Facebook, Instagram, Linkedin, Youtube, type LucideIcon } from "lucide-react";
import type { AnyKnowledgeItem, Topic, Page, Person, Proof, Action, Blog, Social } from "@/lib/siteKnowledge";

interface KnowledgeTileProps {
  item: AnyKnowledgeItem;
  relevanceScore: number;
  position: { x: number; y: number };
  accentColor?: string;
  zoomLevel?: number;
  lightMode?: boolean;
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

const typeColors: Record<string, string> = {
  topic: '#8b5cf6',
  page: '#3b82f6',
  person: '#22c55e',
  proof: '#eab308',
  action: '#ec4899',
  blog: '#f97316',
  social: '#06b6d4',
  manufacturer: '#6366f1',
  product: '#14b8a6',
  concept: '#a855f7',
  qa: '#f59e0b',
  community: '#10b981',
  cta: '#f43f5e',
  sponsored: '#facc15',
};

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

export function KnowledgeTile({ item, relevanceScore, position, accentColor, zoomLevel = 1, lightMode = false }: KnowledgeTileProps) {
  const shouldReduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);
  const CategoryIcon = getCategoryIcon(item);
  
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
        return prod.summary || prod.category || 'Product';
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

  const hasImage = hasOfficialImage;
  const tileWidth = hasImage ? 180 : 160;
  const tileHeight = hasImage ? 140 : 120;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y,
      }}
      transition={shouldReduceMotion ? { duration: 0 } : { 
        type: 'spring', 
        stiffness: 120, 
        damping: 20,
        opacity: { duration: 0.3 }
      }}
      whileHover={shouldReduceMotion ? {} : { 
        y: -2,
        transition: { duration: 0.15 }
      }}
      whileTap={shouldReduceMotion ? {} : { 
        y: -1,
        transition: { duration: 0.08 }
      }}
      className="absolute rounded-lg text-left overflow-hidden"
      style={{
        width: tileWidth,
        height: tileHeight,
        backgroundColor: lightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${color}${Math.floor(30 + glowIntensity * 40).toString(16)}`,
        boxShadow: glowIntensity > 0.2 
          ? `0 0 ${20 + glowIntensity * 40}px ${color}${Math.floor(glowIntensity * 50).toString(16)}, 0 4px 20px ${lightMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.4)'}`
          : lightMode ? '0 4px 20px rgba(0,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.3)',
        left: '50%',
        top: '50%',
        marginLeft: -tileWidth / 2,
        marginTop: -tileHeight / 2,
        cursor: 'pointer',
      }}
      data-tile-id={item.id}
      data-testid={`tile-${item.id}`}
    >
      {/* Image header - official image or designed placeholder */}
      <div 
        className="w-full relative overflow-hidden"
        style={{ 
          height: hasImage ? 60 : 48,
          background: placeholderGradient,
          borderBottom: `1px solid ${color}30`,
        }}
      >
        {/* Official image with lazy loading and error fallback */}
        {imageUrl && !imageError && (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Initials placeholder (always visible under image, shown when no image) */}
        {!hasOfficialImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-xl font-bold"
              style={{ color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            >
              {getInitials()}
            </span>
          </div>
        )}
        {/* Gradient overlay for icon visibility */}
        <div 
          className="absolute inset-0"
          style={{ background: hasOfficialImage ? `linear-gradient(135deg, ${color}90 0%, transparent 70%)` : 'none' }}
        >
          <CategoryIcon className="w-5 h-5 absolute top-2 left-2" style={{ color: 'white', opacity: 0.95 }} />
        </div>
        {/* Relevance indicator */}
        {relevanceScore > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        )}
      </div>
      
      {/* Content - show more copy with bigger fonts */}
      <div className="p-2.5 flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <div 
            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
          >
            <TypeIcon className="w-3.5 h-3.5" style={{ color: 'white' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold leading-tight line-clamp-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              {getLabel()}
            </p>
          </div>
        </div>
        <p className={`text-[10px] line-clamp-2 leading-snug ${lightMode ? 'text-gray-600' : 'text-white/70'}`}>
          {getSummary()}
        </p>
      </div>
      
      {/* Type badge - more visible */}
      <div 
        className="absolute bottom-2 left-2.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide font-semibold"
        style={{ backgroundColor: `${color}40`, color }}
      >
        {item.type}
      </div>
    </motion.div>
  );
}
