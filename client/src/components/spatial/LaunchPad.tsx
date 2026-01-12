import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Video, Share2, MessageCircle, X } from "lucide-react";

interface LaunchPadProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  availability: {
    videoCall: boolean;
    videoReply: boolean;
    chat: boolean;
  };
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export function LaunchPad({ 
  isOpen, 
  onClose, 
  onAction, 
  availability,
  accentColor = '#ffffff', 
  theme = 'dark' 
}: LaunchPadProps) {
  const bgColor = theme === 'dark' ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.95)';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  const actions = [
    { id: 'chat', icon: MessageCircle, label: 'Chat with concierge', available: availability.chat },
    { id: 'call', icon: Phone, label: 'Call', available: true },
    { id: 'email', icon: Mail, label: 'Send email', available: true },
    { id: 'video_reply', icon: Video, label: 'Request video reply', available: availability.videoReply },
    { id: 'video_call', icon: Video, label: 'Video call', available: availability.videoCall, badge: 'Live' },
    { id: 'share', icon: Share2, label: 'Share this experience', available: true },
  ].filter(a => a.available);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] rounded-l-2xl overflow-hidden"
          style={{ 
            background: bgColor,
            border: `1px solid ${borderColor}`,
            borderRight: 'none',
            backdropFilter: 'blur(12px)',
          }}
          data-testid="launch-pad"
        >
          <div 
            className="flex items-center justify-between p-3 px-4"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: mutedColor }}>
              Actions
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full"
              style={{ color: mutedColor }}
              data-testid="launch-pad-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-2 space-y-1">
            {actions.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onAction(action.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group"
                style={{ color: textColor }}
                data-testid={`launch-pad-action-${action.id}`}
              >
                <div 
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    background: `${accentColor}15`,
                    color: accentColor === '#ffffff' ? textColor : accentColor,
                  }}
                >
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium flex-1">{action.label}</span>
                {action.badge && (
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#22c55e', color: 'white' }}
                  >
                    {action.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LaunchPadTriggerProps {
  onClick: () => void;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export function LaunchPadTrigger({ onClick, accentColor = '#ffffff', theme = 'dark' }: LaunchPadTriggerProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-[55] p-3 rounded-full shadow-lg"
      style={{ 
        background: accentColor,
        color: accentColor === '#ffffff' ? '#000' : '#fff',
      }}
      data-testid="launch-pad-trigger"
    >
      <MessageCircle className="w-5 h-5" />
    </motion.button>
  );
}
