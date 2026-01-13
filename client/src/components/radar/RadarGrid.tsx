import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Image, Focus } from "lucide-react";
import { ChatHub, type ChatResponse } from "./ChatHub";
import { KnowledgeTile } from "./KnowledgeTile";
import { SmartWindow } from "./SmartWindow";
import { TileDetailModal } from "./TileDetailModal";
import { VisualPane } from "./VisualPane";
import { ScopedRefinementPane } from "./ScopedRefinementPane";
import type { SiteKnowledge, AnyKnowledgeItem } from "@/lib/siteKnowledge";
import { getAllItems, rankByRelevance, scoreRelevance } from "@/lib/siteKnowledge";
import { ensureMessageBody, type EchoContext } from "@/lib/echoUtils";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

const TAP_THRESHOLD_MS = 200;
const TAP_MOVE_THRESHOLD = 8;

function getItemLabel(item: AnyKnowledgeItem): string {
  switch (item.type) {
    case 'topic': return item.label;
    case 'page': return item.title;
    case 'person': return item.name;
    case 'proof': return item.label;
    case 'action': return item.label;
    case 'blog': return item.title;
    case 'social': return item.connected ? `@${item.handle}` : item.platform.charAt(0).toUpperCase() + item.platform.slice(1);
    case 'manufacturer': return item.name;
    case 'product': return item.name;
    case 'concept': return item.label;
    case 'qa': return item.question;
    case 'community': return item.name;
    case 'cta': return item.label;
    case 'sponsored': return item.name;
    default: return 'Unknown';
  }
}

function getItemSummary(item: AnyKnowledgeItem): string {
  switch (item.type) {
    case 'topic': return item.summary;
    case 'page': return item.summary;
    case 'person': return item.role;
    case 'proof': return item.summary;
    case 'action': return item.summary;
    case 'blog': return item.summary;
    case 'social': return item.connected ? (item.followerCount ? `${item.followerCount.toLocaleString()} followers` : 'View feed') : 'Connect to show feed';
    case 'manufacturer': return `${item.productCount} products`;
    case 'product': return item.summary || item.category || 'Product';
    case 'concept': return item.whyItMatters || 'Learn more';
    case 'qa': return item.sublabel || 'Tap to see answer';
    case 'community': return item.communityType || 'Community';
    case 'cta': return item.summary;
    case 'sponsored': return item.summary || 'Sponsored';
    default: return '';
  }
}

interface RadarGridProps {
  knowledge: SiteKnowledge;
  onSendMessage: (message: string) => Promise<string | ChatResponse>;
  onVideoEvent?: (videoId: number, event: 'play' | 'pause' | 'complete', msWatched?: number) => void;
  orbitSlug?: string;
  accentColor?: string;
  onInteraction?: () => void;
  lightMode?: boolean;
  onCreateIce?: (messageContent: string, messageIndex: number) => void;
  canCreateIce?: boolean;
  isOwnerMode?: boolean;
}

type OwnerPaneTab = 'refine' | 'visual';

interface OwnerPaneProps {
  isVisible: boolean;
  selectedItem: AnyKnowledgeItem | null;
  orbitSlug: string;
  isOwnerMode: boolean;
  onClose: () => void;
}

function OwnerPane({ isVisible, selectedItem, orbitSlug, isOwnerMode, onClose }: OwnerPaneProps) {
  const [activeTab, setActiveTab] = useState<OwnerPaneTab>('refine');
  
  if (!isVisible) return null;
  
  const tileInfo = selectedItem ? {
    id: selectedItem.id,
    label: 'label' in selectedItem ? (selectedItem as any).label : undefined,
    name: 'name' in selectedItem ? (selectedItem as any).name : undefined,
    title: 'title' in selectedItem ? (selectedItem as any).title : undefined,
  } : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-[400px] bg-zinc-900/95 backdrop-blur-sm border-l border-white/10 z-30 flex flex-col"
        data-testid="owner-pane"
      >
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('refine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'refine' 
                  ? 'bg-white/15 text-white' 
                  : 'text-white/50 hover:text-white/80'
              }`}
              data-testid="tab-refine"
            >
              <Focus className="w-3 h-3" />
              Refine
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'visual' 
                  ? 'bg-white/15 text-white' 
                  : 'text-white/50 hover:text-white/80'
              }`}
              data-testid="tab-visual"
            >
              <Image className="w-3 h-3" />
              Visual
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors"
            data-testid="button-close-owner-pane"
          >
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          <div className={`absolute inset-0 ${activeTab === 'refine' ? 'visible' : 'invisible'}`}>
            <ScopedRefinementPane
              tile={tileInfo}
              orbitSlug={orbitSlug}
              isOwnerMode={isOwnerMode}
              className="h-full"
            />
          </div>
          <div className={`absolute inset-0 ${activeTab === 'visual' ? 'visible' : 'invisible'}`}>
            <VisualPane
              tile={tileInfo}
              orbitSlug={orbitSlug}
              isOwnerMode={isOwnerMode}
              className="h-full"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const SAFE_ZONE_RADIUS = 200;
const RING_SPACING = 120;
const MAX_VISIBLE_TILES = 18;

function generateTilePositions(count: number, ringSpacing: number = RING_SPACING): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  let ring = 1;
  let placed = 0;
  
  while (placed < count) {
    const radius = SAFE_ZONE_RADIUS + ring * ringSpacing;
    const tilesInRing = Math.max(5, Math.floor(ring * 5));
    const angleStep = (2 * Math.PI) / tilesInRing;
    const staggerOffset = ring % 2 === 0 ? angleStep / 2 : 0;
    
    for (let i = 0; i < tilesInRing && placed < count; i++) {
      const angle = angleStep * i - Math.PI / 2 + staggerOffset;
      const jitter = (Math.random() - 0.5) * 15;
      positions.push({
        x: Math.cos(angle) * radius + jitter,
        y: Math.sin(angle) * radius + jitter,
      });
      placed++;
    }
    ring++;
  }
  
  return positions;
}

export function RadarGrid({ knowledge, onSendMessage, onVideoEvent, orbitSlug, accentColor = '#3b82f6', onInteraction, lightMode = false, onCreateIce, canCreateIce = false, isOwnerMode = false }: RadarGridProps) {
  const [isHubMinimized, setIsHubMinimized] = useState(false);
  const [conversationKeywords, setConversationKeywords] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnyKnowledgeItem | null>(null);
  const [showTileDetail, setShowTileDetail] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showVisualPane, setShowVisualPane] = useState(false);
  const isDesktop = useIsDesktop();
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistance = useRef<number | null>(null);
  const initialZoom = useRef<number>(1);
  const tapStartTime = useRef<number>(0);
  const tapStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pendingTileClick = useRef<AnyKnowledgeItem | null>(null);
  const hasMoved = useRef<boolean>(false);

  const allItems = useMemo(() => getAllItems(knowledge), [knowledge]);
  
  const rankedItems = useMemo(() => {
    const query = conversationKeywords.join(' ');
    return rankByRelevance(allItems, query);
  }, [allItems, conversationKeywords]);

  // Calculate intent level from conversation (0 = ambient, higher = more focused)
  const intentLevel = useMemo(() => {
    return Math.min(conversationKeywords.length / 5, 1); // 0-1 scale
  }, [conversationKeywords]);

  const visibleItems = useMemo(() => {
    const query = conversationKeywords.join(' ');
    const scoredItems = rankedItems.map(item => ({
      item,
      score: scoreRelevance(item, query)
    }));
    
    const maxVisible = Math.round(MAX_VISIBLE_TILES - intentLevel * 6);
    
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(12, maxVisible));
  }, [rankedItems, conversationKeywords, intentLevel]);

  const positionMap = useMemo(() => {
    const tileWidth = 200;
    const tileHeight = 90;
    const tileGap = 30;
    
    const map = new Map<string, { x: number; y: number; distance: number }>();
    
    const firstRingRadius = SAFE_ZONE_RADIUS + RING_SPACING;
    
    let placed = 0;
    let ringIndex = 0;
    
    while (placed < visibleItems.length) {
      const ringRadius = firstRingRadius + ringIndex * RING_SPACING;
      
      const circumference = 2 * Math.PI * ringRadius;
      const tileFootprint = tileWidth + tileGap;
      const maxTilesInRing = Math.max(1, Math.floor(circumference / tileFootprint));
      
      const tilesInRing = Math.min(maxTilesInRing, visibleItems.length - placed);
      
      const staggerAngle = (ringIndex % 2 === 0) ? 0 : Math.PI / Math.max(tilesInRing, 1);
      
      for (let i = 0; i < tilesInRing && placed < visibleItems.length; i++) {
        const { item } = visibleItems[placed];
        const angle = (i / tilesInRing) * 2 * Math.PI - Math.PI / 2 + staggerAngle;
        
        map.set(item.id, {
          x: Math.cos(angle) * ringRadius,
          y: Math.sin(angle) * ringRadius,
          distance: ringRadius,
        });
        placed++;
      }
      ringIndex++;
    }
    return map;
  }, [visibleItems]);

  const handleIntentChange = useCallback((keywords: string[]) => {
    setConversationKeywords(prev => {
      const combined = [...prev, ...keywords];
      return combined.slice(-20);
    });
  }, []);

  const handleTileClick = useCallback((item: AnyKnowledgeItem) => {
    console.log('[RadarGrid] handleTileClick:', item.id, 'isOwnerMode:', isOwnerMode);
    setSelectedItem(item);
    setIsHubMinimized(false);
    const itemKeywords = item.keywords.slice(0, 3);
    handleIntentChange(itemKeywords);
    onInteraction?.();
    
    if (isOwnerMode && isDesktop) {
      setShowVisualPane(true);
    } else {
      setShowTileDetail(true);
    }
  }, [handleIntentChange, onInteraction, isOwnerMode, isDesktop]);
  
  const handleCloseTileDetail = useCallback(() => {
    setShowTileDetail(false);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (selectedItem) {
      const context = `[User clicked on: ${selectedItem.type} - ${getItemLabel(selectedItem)}] ${message}`;
      setSelectedItem(null);
      return onSendMessage(context);
    }
    return onSendMessage(message);
  }, [onSendMessage, selectedItem]);

  const getInitialMessage = useCallback(() => {
    if (!selectedItem) return undefined;
    
    const itemName = getItemLabel(selectedItem);
    const summary = getItemSummary(selectedItem);
    const brandName = knowledge.brand?.name || "this team";
    
    const ctx: EchoContext = {
      brandName,
      itemLabel: itemName,
      itemType: selectedItem.type,
      itemText: summary,
      pageUrl: 'url' in selectedItem ? (selectedItem as { url?: string }).url : undefined,
    };
    
    let message: string;
    
    switch (selectedItem.type) {
      case 'page': {
        const page = selectedItem as import('@/lib/siteKnowledge').Page;
        const hasWeatherKeywords = page.keywords.some(k => 
          ['weather', 'forecast', 'temperature', 'climate'].includes(k.toLowerCase())
        );
        if (hasWeatherKeywords) {
          message = `${itemName}\n\n${summary}\n\nTell me your location for specific information, or visit: ${page.url}`;
        } else {
          message = page.url && page.url !== '#' 
            ? `${itemName}\n\n${summary}\n\nVisit: ${page.url}`
            : `${itemName}\n\n${summary}`;
        }
        break;
      }
      case 'topic': {
        if (summary && summary.toLowerCase() !== itemName.toLowerCase()) {
          message = `${itemName}\n\n${summary}`;
        } else {
          message = itemName;
        }
        break;
      }
      case 'action': {
        const action = selectedItem as import('@/lib/siteKnowledge').Action;
        const actionPrompts: Record<string, string> = {
          'video_reply': `Send a video message\n\n${summary}\n\nSay "record" to start.`,
          'call': `Schedule a call\n\n${summary}\n\nTell me when works for you.`,
          'email': `Send a message\n\n${summary}`,
          'quote': `Get a quote\n\n${summary}\n\nTell me what you need.`
        };
        message = actionPrompts[action.actionType] || `${itemName}\n\n${summary}`;
        break;
      }
      case 'person': {
        const person = selectedItem as import('@/lib/siteKnowledge').Person;
        const contactParts = [];
        if (person.email) contactParts.push(person.email);
        if (person.phone) contactParts.push(person.phone);
        const contactLine = contactParts.length > 0 ? `\n\nContact: ${contactParts.join(' · ')}` : '';
        message = `${person.name}, ${person.role}${contactLine}`;
        break;
      }
      case 'proof': {
        message = `${itemName}\n\n${summary || ''}`;
        break;
      }
      case 'blog': {
        const blog = selectedItem as import('@/lib/siteKnowledge').Blog;
        message = `${itemName}\n\n${summary}\n\nRead more: ${blog.url}`;
        break;
      }
      case 'social': {
        const social = selectedItem as import('@/lib/siteKnowledge').Social;
        const platformName = social.platform.charAt(0).toUpperCase() + social.platform.slice(1);
        if (social.connected) {
          const followerInfo = social.followerCount ? ` · ${social.followerCount.toLocaleString()} followers` : '';
          message = `${platformName} (@${social.handle})${followerInfo}\n\n${social.url}`;
        } else {
          message = `Connect ${platformName} to display your feed here.`;
        }
        break;
      }
      case 'manufacturer': {
        const manufacturer = selectedItem as import('@/lib/siteKnowledge').Manufacturer;
        const productInfo = manufacturer.productCount > 0 ? `${manufacturer.productCount} product${manufacturer.productCount > 1 ? 's' : ''}` : '';
        const websiteInfo = manufacturer.websiteUrl ? `\n\nWebsite: ${manufacturer.websiteUrl}` : '';
        message = `${manufacturer.name}${productInfo ? ` · ${productInfo}` : ''}${websiteInfo}\n\nAsk me about ${manufacturer.name}'s products or latest news.`;
        break;
      }
      case 'product': {
        const product = selectedItem as import('@/lib/siteKnowledge').Product;
        const status = product.status || 'unknown';
        const statusEmoji = status === 'shipping' ? '✅' : status === 'announced' ? '📢' : '🔮';
        const specInfo = product.primarySpec ? `${product.primarySpec.key}: ${product.primarySpec.value}` : '';
        const manufacturerPart = product.manufacturerName ? ` by ${product.manufacturerName}` : '';
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        message = `${product.name}${manufacturerPart}\n\n${statusEmoji} ${statusLabel}${specInfo ? ` · ${specInfo}` : ''}${product.summary ? `\n\n${product.summary}` : ''}`;
        break;
      }
      case 'concept': {
        const concept = selectedItem as import('@/lib/siteKnowledge').Concept;
        const questions = concept.starterQuestions?.slice(0, 2).map(q => `• ${q}`).join('\n') || '';
        message = `${concept.label}\n\n${concept.whyItMatters}${questions ? `\n\nQuestions you might ask:\n${questions}` : ''}`;
        break;
      }
      case 'qa': {
        const qa = selectedItem as import('@/lib/siteKnowledge').QA;
        const sublabel = qa.sublabel || '';
        const hasContextualAnswer = qa.answer && qa.answer.length > 50 && !qa.answer.toLowerCase().includes('long-lasting') && !qa.answer.toLowerCase().includes('tap to');
        
        if (hasContextualAnswer) {
          message = `${qa.question}\n\n${qa.answer}`;
        } else {
          message = `${qa.question}\n\n${sublabel ? sublabel + '\n\n' : ''}I'll help you find the best options. What matters most to you?\n\n• Camera quality\n• Display features\n• All-day battery\n• Compact design`;
        }
        break;
      }
      case 'community': {
        const community = selectedItem as import('@/lib/siteKnowledge').Community;
        const communityType = community.communityType || 'online';
        const typeLabel = communityType === 'subreddit' ? 'Reddit' : communityType.charAt(0).toUpperCase() + communityType.slice(1);
        const urlPart = community.url ? `\n\nJoin: ${community.url}` : '';
        message = `${community.name}\n\n${typeLabel} community${urlPart}`;
        break;
      }
      default:
        message = `${itemName}\n\n${summary}`;
    }
    
    return ensureMessageBody(message, ctx);
  }, [selectedItem, knowledge.brand?.name]);

  const nearbyTileLabels = useMemo(() => {
    return visibleItems.slice(0, 5).map(({ item }) => getItemLabel(item));
  }, [visibleItems]);

  const getPinchDistance = useCallback(() => {
    const pointers = Array.from(activePointers.current.values());
    if (pointers.length < 2) return null;
    const dx = pointers[1].x - pointers[0].x;
    const dy = pointers[1].y - pointers[0].y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-chat-hub]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    tapStartTime.current = Date.now();
    tapStartPos.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
    pendingTileClick.current = null;
    
    const tileEl = target.closest('[data-tile-id]');
    if (tileEl) {
      const tileId = tileEl.getAttribute('data-tile-id');
      pendingTileClick.current = allItems.find(item => item.id === tileId) || null;
    }
    
    if (activePointers.current.size === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...canvasOffset };
    } else if (activePointers.current.size === 2) {
      setIsDragging(false);
      initialPinchDistance.current = getPinchDistance();
      initialZoom.current = zoomLevel;
    }
    
    containerRef.current?.setPointerCapture?.(e.pointerId);
  }, [canvasOffset, zoomLevel, getPinchDistance, allItems]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activePointers.current.has(e.pointerId)) return;
    
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    
    const dx = e.clientX - tapStartPos.current.x;
    const dy = e.clientY - tapStartPos.current.y;
    const movedDistance = Math.sqrt(dx * dx + dy * dy);
    if (movedDistance > TAP_MOVE_THRESHOLD) {
      hasMoved.current = true;
    }
    
    if (activePointers.current.size === 2 && initialPinchDistance.current) {
      const currentDistance = getPinchDistance();
      if (currentDistance) {
        const scale = currentDistance / initialPinchDistance.current;
        const newZoom = Math.max(0.4, Math.min(2.5, initialZoom.current * scale));
        setZoomLevel(newZoom);
      }
    } else if (isDragging && activePointers.current.size === 1) {
      const panDx = e.clientX - dragStart.current.x;
      const panDy = e.clientY - dragStart.current.y;
      setCanvasOffset({
        x: offsetStart.current.x + panDx,
        y: offsetStart.current.y + panDy,
      });
    }
  }, [isDragging, getPinchDistance]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const elapsed = Date.now() - tapStartTime.current;
    const wasTap = elapsed < TAP_THRESHOLD_MS && !hasMoved.current;
    
    if (wasTap && pendingTileClick.current && activePointers.current.size === 1) {
      handleTileClick(pendingTileClick.current);
    }
    
    activePointers.current.delete(e.pointerId);
    containerRef.current?.releasePointerCapture?.(e.pointerId);
    
    if (activePointers.current.size < 2) {
      initialPinchDistance.current = null;
    }
    if (activePointers.current.size === 0) {
      setIsDragging(false);
    }
    pendingTileClick.current = null;
  }, [handleTileClick]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoomLevel(prev => Math.max(0.5, Math.min(2, prev + delta)));
  }, []);

  const gridSize = 60;
  const gridOffsetX = canvasOffset.x % gridSize;
  const gridOffsetY = canvasOffset.y % gridSize;

  const bgColor = lightMode ? '#f8fafc' : '#0a0a0a';
  const gridLineColor = lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)';
  const edgeFadeColor = lightMode ? '#f8fafc' : '#0a0a0a';

  const showSmartWindow = showTileDetail && !isOwnerMode && isDesktop;

  return (
    <div className="fixed inset-0 flex" data-testid="radar-layout">
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden select-none"
        style={{
          background: bgColor,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        data-testid="radar-grid"
      >
      {/* Faint network pattern background */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        style={{ opacity: lightMode ? 0.03 : 0.025 }}
      >
        <defs>
          <pattern id="network-nodes" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="1" fill={lightMode ? '#000' : '#fff'} />
          </pattern>
          <pattern id="network-lines" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <line x1="0" y1="80" x2="80" y2="0" stroke={lightMode ? '#000' : '#fff'} strokeWidth="0.5" opacity="0.3" />
            <line x1="80" y1="160" x2="160" y2="80" stroke={lightMode ? '#000' : '#fff'} strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#network-nodes)" />
        <rect width="100%" height="100%" fill="url(#network-lines)" />
      </svg>
      
      {/* Subtle dot grid - ambient background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(${gridLineColor} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
        }}
      />
      
      {/* Radial glow from center - stronger to anchor chat */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${accentColor}18 0%, ${accentColor}08 15%, transparent 40%)`,
        }}
      />
      
      {/* Safe zone - clear area around center */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '45%',
          width: (SAFE_ZONE_RADIUS + RING_SPACING) * 2,
          height: (SAFE_ZONE_RADIUS + RING_SPACING) * 2,
          marginLeft: -(SAFE_ZONE_RADIUS + RING_SPACING),
          marginTop: -(SAFE_ZONE_RADIUS + RING_SPACING),
          borderRadius: '50%',
          background: `radial-gradient(circle, ${bgColor} 0%, ${bgColor} 50%, transparent 100%)`,
        }}
      />
      
      {/* Pannable tile layer - moves with canvas offset */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
        data-testid="tile-layer"
      >
        {visibleItems.map(({ item, score }) => {
          const pos = positionMap.get(item.id) || { x: 0, y: 0, distance: 400 };
          
          const tierAThreshold = SAFE_ZONE_RADIUS + RING_SPACING * 1.5;
          const tierBThreshold = SAFE_ZONE_RADIUS + RING_SPACING * 2.5;
          const depthTier: 'A' | 'B' | 'C' = 
            pos.distance <= tierAThreshold ? 'A' : 
            pos.distance <= tierBThreshold ? 'B' : 'C';
          
          return (
            <KnowledgeTile
              key={item.id}
              item={item}
              relevanceScore={score}
              position={{ x: pos.x, y: pos.y }}
              accentColor={accentColor}
              lightMode={lightMode}
              zoomLevel={zoomLevel}
              depthTier={depthTier}
              onSelect={handleTileClick}
            />
          );
        })}
      </div>

      {/* Feather edge - fade at screen edges for infinite universe feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: lightMode
            ? `radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, rgba(248,250,252,0.3) 55%, rgba(248,250,252,0.7) 75%, ${edgeFadeColor} 100%)`
            : `radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, rgba(10,10,10,0.3) 55%, rgba(10,10,10,0.7) 75%, ${edgeFadeColor} 100%)`,
          zIndex: 10,
        }}
      />

      {/* Fixed ChatHub - NEVER moves with canvas */}
      <AnimatePresence mode="wait">
        <ChatHub
          key="chat-hub-stable"
          brandName={knowledge.brand.name}
          accentColor={accentColor}
          lightMode={lightMode}
          onSendMessage={handleSendMessage}
          onVideoEvent={onVideoEvent}
          orbitSlug={orbitSlug}
          onIntentChange={handleIntentChange}
          initialMessage={getInitialMessage()}
          isMinimized={isHubMinimized}
          onMinimize={() => setIsHubMinimized(true)}
          onExpand={() => setIsHubMinimized(false)}
          nearbyTiles={nearbyTileLabels}
          onCreateIce={onCreateIce}
          canCreateIce={canCreateIce}
          isOwnerMode={isOwnerMode}
        />
      </AnimatePresence>

      {/* Zoom Slider Control */}
      <div 
        className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/10"
        style={{ zIndex: 20 }}
        data-testid="zoom-controls"
        role="group"
        aria-label="Zoom controls"
      >
        <button
          onClick={() => setZoomLevel(z => Math.max(0.4, z - 0.1))}
          className="w-6 h-6 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          data-testid="zoom-out-button"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="range"
          min="40"
          max="250"
          value={Math.round(Math.min(2.5, zoomLevel) * 100)}
          onChange={(e) => setZoomLevel(parseInt(e.target.value) / 100)}
          className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          data-testid="zoom-slider"
          aria-label="Zoom level"
          title={`Zoom: ${Math.round(zoomLevel * 100)}%`}
        />
        <button
          onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.1))}
          className="w-6 h-6 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          data-testid="zoom-in-button"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <span className="text-white/40 text-xs w-8 text-right tabular-nums" aria-live="polite">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>

      {/* Movement hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none text-center" style={{ zIndex: 20 }}>
        Tiles move to reflect what we're talking about
      </div>

      {/* Owner Pane - Visual Preview + Scoped Refinement on desktop with tabs */}
      <OwnerPane
        isVisible={isOwnerMode && isDesktop && showVisualPane}
        selectedItem={selectedItem}
        orbitSlug={orbitSlug || ''}
        isOwnerMode={isOwnerMode}
        onClose={() => setShowVisualPane(false)}
      />
      </div>
      
      {/* Smart Window - Right-docked panel for public users (desktop) */}
      {showSmartWindow && (
        <SmartWindow
          item={selectedItem}
          isOpen={showSmartWindow}
          onClose={handleCloseTileDetail}
          accentColor={accentColor}
          lightMode={lightMode}
        />
      )}
      
      {/* Tile Detail Modal - Fallback for mobile/tablet public users */}
      <TileDetailModal
        item={selectedItem}
        isOpen={showTileDetail && !isOwnerMode && !isDesktop}
        onClose={handleCloseTileDetail}
        accentColor={accentColor}
        lightMode={lightMode}
      />
    </div>
  );
}
