import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { INTENT_OPTIONS, type SiteCard, type SiteCatalogue } from "@/lib/siteCatalogue";

interface Message {
  id: number;
  role: 'user' | 'concierge';
  content: string;
  suggestedCard?: SiteCard;
  timestamp: number;
}

interface ConciergeChatProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSuggested: (card: SiteCard) => void;
  catalogue: SiteCatalogue;
  accentColor?: string;
  theme?: 'dark' | 'light';
  onSendMessage?: (message: string, context?: string) => Promise<string>;
}

export function ConciergeChat({ 
  isOpen, 
  onClose, 
  onCardSuggested,
  catalogue,
  accentColor = '#ffffff', 
  theme = 'dark',
  onSendMessage,
}: ConciergeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [showIntentPicker, setShowIntentPicker] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const bgColor = theme === 'dark' ? '#0f0f0f' : '#ffffff';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
  const subtleBg = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: Message = {
        id: Date.now(),
        role: 'concierge',
        content: `Welcome to ${catalogue.brand.name}. I'm here to help you find what you need. What brings you here today?`,
        timestamp: Date.now(),
      };
      setMessages([welcome]);
    }
  }, [isOpen, catalogue.brand.name]);
  
  const handleIntentSelect = (intentId: string) => {
    setSelectedIntent(intentId);
    setShowIntentPicker(false);
    
    const intent = INTENT_OPTIONS.find(i => i.id === intentId);
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: intent?.label || intentId,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    
    const event = { type: 'intent_selected', timestamp: Date.now(), data: { intent: intentId } };
    const existing = JSON.parse(localStorage.getItem('sessionEvents') || '[]');
    localStorage.setItem('sessionEvents', JSON.stringify([...existing, event]));
    
    setTimeout(() => {
      let response = '';
      let suggestedCard: SiteCard | undefined;
      
      const startCards = catalogue.lanes.find(l => l.id === 'start')?.cards || [];
      const serviceCards = catalogue.lanes.find(l => l.id === 'services')?.cards || [];
      
      switch (intentId) {
        case 'browsing':
          response = `Great! Feel free to explore the cards behind me. I've organized ${catalogue.brand.name}'s content into easy-to-browse sections. If you want, I can point you to the most popular starting point.`;
          suggestedCard = startCards[0];
          break;
        case 'comparing':
          response = `I can help you understand what makes ${catalogue.brand.name} different. Would you like me to highlight key services, or do you have specific requirements you're comparing against?`;
          suggestedCard = serviceCards[0];
          break;
        case 'existing':
          response = `Welcome back! How can I help you today? Are you looking for support, billing info, or something else?`;
          break;
        case 'urgent':
          response = `I understand you need help quickly. Let me connect you with the right resource. Would you prefer to call, email, or request a video reply?`;
          suggestedCard = catalogue.lanes.find(l => l.id === 'contact')?.cards[0];
          break;
        case 'research':
          response = `Happy to help with your research. I can share information about ${catalogue.brand.name}'s services and approach. What specific aspects are you investigating?`;
          suggestedCard = startCards[0];
          break;
        default:
          response = `No problem! Take your time to explore. I'm here whenever you have questions. The cards behind me show everything ${catalogue.brand.name} offers.`;
      }
      
      const conciergeMsg: Message = {
        id: Date.now(),
        role: 'concierge',
        content: response,
        suggestedCard,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, conciergeMsg]);
      setIsTyping(false);
    }, 1200);
  };
  
  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;
    
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    const event = { type: 'question_asked', timestamp: Date.now(), data: { question: text } };
    const existing = JSON.parse(localStorage.getItem('sessionEvents') || '[]');
    localStorage.setItem('sessionEvents', JSON.stringify([...existing, event]));
    
    let response = '';
    if (onSendMessage) {
      try {
        response = await onSendMessage(text, selectedIntent || undefined);
      } catch {
        response = `I'd be happy to help with that. Let me find the most relevant information from ${catalogue.brand.name}'s content.`;
      }
    } else {
      await new Promise(r => setTimeout(r, 1000));
      const allCards = catalogue.lanes.flatMap(l => l.cards);
      const relevantCard = allCards.find(c => 
        c.title.toLowerCase().includes(text.toLowerCase()) ||
        c.summary.toLowerCase().includes(text.toLowerCase())
      );
      
      if (relevantCard) {
        response = `I found something that might help: "${relevantCard.title}". Would you like to explore this?`;
      } else {
        response = `That's a great question. Based on what ${catalogue.brand.name} offers, I'd suggest exploring the services section, or you can ask me something more specific.`;
      }
    }
    
    const conciergeMsg: Message = {
      id: Date.now(),
      role: 'concierge',
      content: response,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, conciergeMsg]);
    setIsTyping(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-[70] md:right-6 md:left-auto md:bottom-6 md:w-96"
      data-testid="concierge-chat"
    >
      <div 
        className="rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[75vh] md:max-h-[600px] overflow-hidden"
        style={{ 
          background: bgColor, 
          border: `1px solid ${borderColor}`,
          boxShadow: `0 0 0 1px ${accentColor}20, 0 25px 50px -12px rgba(0,0,0,0.5)`
        }}
      >
        <div 
          className="flex items-center justify-between p-4 shrink-0"
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `${accentColor}20` }}
            >
              <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div>
              <span className="font-semibold text-sm block" style={{ color: textColor }}>Concierge</span>
              <span className="text-[10px]" style={{ color: mutedColor }}>AI assistant</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: mutedColor }}
            data-testid="concierge-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4"
          style={{ minHeight: 200, maxHeight: 'calc(75vh - 140px)' }}
        >
          <div className="space-y-3">
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[85%]">
                  <div 
                    className="p-3 rounded-xl text-sm leading-relaxed"
                    style={msg.role === 'user' 
                      ? { background: accentColor, color: accentColor === '#ffffff' ? '#000' : '#fff', borderRadius: '12px 12px 4px 12px' }
                      : { background: subtleBg, color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', border: `1px solid ${borderColor}`, borderRadius: '12px 12px 12px 4px' }
                    }
                  >
                    {msg.content}
                  </div>
                  
                  {msg.suggestedCard && (
                    <button
                      onClick={() => onCardSuggested(msg.suggestedCard!)}
                      className="mt-2 flex items-center gap-2 text-xs p-2 rounded-lg transition-colors"
                      style={{ 
                        background: `${accentColor}15`,
                        color: accentColor === '#ffffff' ? textColor : accentColor,
                        border: `1px solid ${accentColor}30`,
                      }}
                      data-testid={`suggested-card-${msg.suggestedCard.id}`}
                    >
                      <ChevronDown className="w-3 h-3" />
                      View: {msg.suggestedCard.title}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div 
                  className="p-3 rounded-xl flex gap-1 items-center"
                  style={{ background: subtleBg, border: `1px solid ${borderColor}` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ background: mutedColor }}></span>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ background: mutedColor }}></span>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: mutedColor }}></span>
                </div>
              </motion.div>
            )}
          </div>
          
          {showIntentPicker && !selectedIntent && messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-2"
            >
              {INTENT_OPTIONS.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => handleIntentSelect(intent.id)}
                  className="w-full text-left p-3 rounded-lg text-sm transition-all"
                  style={{ 
                    background: subtleBg,
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                  }}
                  data-testid={`intent-option-${intent.id}`}
                >
                  {intent.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        
        <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="h-10 rounded-full px-4 text-sm"
              style={{ 
                background: subtleBg, 
                border: `1px solid ${borderColor}`,
                color: textColor
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
              data-testid="concierge-input"
            />
            <button
              onClick={() => handleSend()}
              className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center disabled:opacity-50"
              style={{ background: accentColor, color: accentColor === '#ffffff' ? '#000' : '#fff' }}
              disabled={isTyping || !input.trim()}
              data-testid="concierge-send"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ConciergeTriggerProps {
  onClick: () => void;
  accentColor?: string;
  theme?: 'dark' | 'light';
  unreadCount?: number;
}

export function ConciergeTrigger({ onClick, accentColor = '#ffffff', theme = 'dark', unreadCount }: ConciergeTriggerProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed right-4 bottom-4 z-[60] p-4 rounded-full shadow-2xl"
      style={{ 
        background: accentColor,
        color: accentColor === '#ffffff' ? '#000' : '#fff',
        boxShadow: `0 0 30px ${accentColor}40`,
      }}
      data-testid="concierge-trigger"
    >
      <MessageCircle className="w-6 h-6" />
      {unreadCount && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </motion.button>
  );
}
