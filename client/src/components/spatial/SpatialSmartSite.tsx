import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, ExternalLink } from "lucide-react";
import { SpatialDeck } from "./SpatialDeck";
import { CardViewer } from "./CardViewer";
import { ConciergeChat, ConciergeTrigger } from "./ConciergeChat";
import { LaunchPad, LaunchPadTrigger } from "./LaunchPad";
import { ShareModal, parseShareState } from "./ShareState";
import { VideoReplyModal, VideoCallModal } from "./VideoModals";
import { createMockCatalogue, type SiteCard, type SiteCatalogue, type ShareableState } from "@/lib/siteCatalogue";

interface SiteIdentity {
  sourceDomain: string;
  title: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  heroDescription: string | null;
  primaryColour: string;
  serviceBullets?: string[];
  faqCandidates?: string[];
}

interface ValidatedContent {
  overview: string;
  whatWeDo: string[];
  commonQuestions: { question: string; contextPrompt: string }[];
  brandName: string;
}

interface BrandPreferences {
  accentColor: string;
  theme: 'dark' | 'light';
  selectedLogo: string | null;
  selectedImages: string[];
}

interface SpatialSmartSiteProps {
  siteIdentity: SiteIdentity;
  validatedContent?: ValidatedContent | null;
  brandPreferences?: BrandPreferences | null;
  onSendMessage?: (message: string, context?: string) => Promise<string>;
}

export function SpatialSmartSite({ 
  siteIdentity, 
  validatedContent,
  brandPreferences,
  onSendMessage,
}: SpatialSmartSiteProps) {
  const [catalogue, setCatalogue] = useState<SiteCatalogue | null>(null);
  const [activeCard, setActiveCard] = useState<SiteCard | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [launchPadOpen, setLaunchPadOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [videoReplyOpen, setVideoReplyOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  
  const accentColor = brandPreferences?.accentColor || '#ffffff';
  const theme = brandPreferences?.theme || 'dark';
  const bgColor = theme === 'dark' ? '#0a0a0a' : '#f5f5f5';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  
  const displayLogo = brandPreferences?.selectedLogo || siteIdentity.logoUrl || siteIdentity.faviconUrl;
  
  useEffect(() => {
    const cat = createMockCatalogue(siteIdentity, validatedContent || undefined);
    setCatalogue(cat);
    
    const initialState = parseShareState(window.location.href);
    if (initialState?.activeCardId) {
      const card = cat.lanes.flatMap(l => l.cards).find(c => c.id === initialState.activeCardId);
      if (card) setActiveCard(card);
    }
  }, [siteIdentity, validatedContent]);
  
  const handleCardClick = useCallback((card: SiteCard) => {
    setActiveCard(card);
    
    const event = { type: 'card_opened', timestamp: Date.now(), data: { cardId: card.id, cardType: card.type } };
    const existing = JSON.parse(localStorage.getItem('sessionEvents') || '[]');
    localStorage.setItem('sessionEvents', JSON.stringify([...existing, event]));
  }, []);
  
  const handleAskAbout = useCallback((card: SiteCard) => {
    setCurrentQuestion(`Tell me more about: ${card.title}`);
    setChatOpen(true);
  }, []);
  
  const handleAction = useCallback((action: string, card?: SiteCard) => {
    const event = { type: 'action_clicked', timestamp: Date.now(), data: { action, cardId: card?.id } };
    const existing = JSON.parse(localStorage.getItem('sessionEvents') || '[]');
    localStorage.setItem('sessionEvents', JSON.stringify([...existing, event]));
    
    switch (action) {
      case 'chat':
        setChatOpen(true);
        break;
      case 'share':
        setShareOpen(true);
        break;
      case 'video_reply':
        setVideoReplyOpen(true);
        break;
      case 'video_call':
        setVideoCallOpen(true);
        break;
      case 'email':
        window.location.href = `mailto:contact@${siteIdentity.sourceDomain}`;
        break;
      case 'call':
        break;
    }
  }, [siteIdentity.sourceDomain]);
  
  const handleLaunchPadAction = useCallback((action: string) => {
    setLaunchPadOpen(false);
    handleAction(action);
  }, [handleAction]);
  
  const getShareState = useCallback((): ShareableState => {
    return {
      activeCardId: activeCard?.id,
      activeLaneId: activeCard ? catalogue?.lanes.find(l => l.cards.some(c => c.id === activeCard.id))?.id : undefined,
    };
  }, [activeCard, catalogue]);
  
  if (!catalogue) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: bgColor }}
      >
        <div className="animate-pulse" style={{ color: mutedColor }}>Loading experience...</div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: bgColor }}
      data-testid="spatial-smart-site"
    >
      <header 
        className="sticky top-0 z-50 px-4 py-3 backdrop-blur-lg"
        style={{ 
          background: `${bgColor}e6`,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            {displayLogo && (
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center p-1.5"
                style={{ 
                  background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  border: `1.5px solid ${accentColor}40`
                }}
              >
                <img
                  src={displayLogo}
                  alt=""
                  className="w-full h-full object-contain"
                  style={{ filter: theme === 'dark' ? 'brightness(1.1)' : 'none' }}
                />
              </div>
            )}
            <div>
              <h1 className="text-sm font-semibold" style={{ color: textColor }}>
                {catalogue.brand.name}
              </h1>
              <a 
                href={`https://${siteIdentity.sourceDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] flex items-center gap-1 transition-colors"
                style={{ color: mutedColor }}
              >
                {siteIdentity.sourceDomain}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
          
          <button
            onClick={() => setShareOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: mutedColor }}
            data-testid="header-share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      <SpatialDeck
        lanes={catalogue.lanes}
        onCardClick={handleCardClick}
        accentColor={accentColor}
        theme={theme}
      />
      
      {activeCard && (
        <CardViewer
          card={activeCard}
          onClose={() => setActiveCard(null)}
          onAskAbout={handleAskAbout}
          onAction={(action, card) => handleAction(action, card)}
          accentColor={accentColor}
          theme={theme}
        />
      )}
      
      {!chatOpen && (
        <ConciergeTrigger
          onClick={() => setChatOpen(true)}
          accentColor={accentColor}
          theme={theme}
        />
      )}
      
      <ConciergeChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onCardSuggested={(card) => {
          setActiveCard(card);
          setChatOpen(false);
        }}
        catalogue={catalogue}
        accentColor={accentColor}
        theme={theme}
        onSendMessage={onSendMessage}
      />
      
      <LaunchPad
        isOpen={launchPadOpen}
        onClose={() => setLaunchPadOpen(false)}
        onAction={handleLaunchPadAction}
        availability={catalogue.availability}
        accentColor={accentColor}
        theme={theme}
      />
      
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        state={getShareState()}
        brandName={catalogue.brand.name}
        accentColor={accentColor}
        theme={theme}
      />
      
      <VideoReplyModal
        isOpen={videoReplyOpen}
        onClose={() => setVideoReplyOpen(false)}
        brandName={catalogue.brand.name}
        prefillQuestion={currentQuestion}
        accentColor={accentColor}
        theme={theme}
      />
      
      <VideoCallModal
        isOpen={videoCallOpen}
        onClose={() => setVideoCallOpen(false)}
        onFallback={() => setVideoReplyOpen(true)}
        available={catalogue.availability.videoCall}
        brandName={catalogue.brand.name}
        accentColor={accentColor}
        theme={theme}
      />
    </div>
  );
}
