import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, CheckCircle, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShareableState } from "@/lib/siteCatalogue";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ShareableState;
  brandName: string;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  state,
  brandName,
  accentColor = '#ffffff', 
  theme = 'dark' 
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  const shareUrl = generateShareUrl(state);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    const event = { type: 'action_clicked', timestamp: Date.now(), data: { action: 'share_copied' } };
    const existing = JSON.parse(localStorage.getItem('sessionEvents') || '[]');
    localStorage.setItem('sessionEvents', JSON.stringify([...existing, event]));
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{ background: bgColor, border: `1px solid ${borderColor}` }}
          data-testid="share-modal"
        >
          <div 
            className="flex items-center justify-between p-4"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5" style={{ color: accentColor }} />
              <span className="font-semibold" style={{ color: textColor }}>Share this experience</span>
            </div>
            <button onClick={onClose} style={{ color: mutedColor }} data-testid="share-close">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-5">
            <p className="text-sm mb-4" style={{ color: mutedColor }}>
              Share your current view of {brandName} with colleagues. They'll see exactly what you're looking at.
            </p>
            
            {state.activeCardId && (
              <div 
                className="p-3 rounded-lg mb-4 text-sm"
                style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}20` }}
              >
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: mutedColor }}>
                  Currently viewing
                </p>
                <p style={{ color: textColor }}>{state.activeCardId}</p>
              </div>
            )}
            
            {state.summary && (
              <div 
                className="p-3 rounded-lg mb-4 text-sm"
                style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}20` }}
              >
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: mutedColor }}>
                  Conversation summary
                </p>
                <p style={{ color: textColor }}>{state.summary}</p>
              </div>
            )}
            
            <div 
              className="flex items-center gap-2 p-3 rounded-lg mb-4"
              style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <Link className="w-4 h-4 flex-shrink-0" style={{ color: mutedColor }} />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: textColor }}
              />
            </div>
            
            <Button
              onClick={handleCopy}
              className="w-full"
              style={{ 
                background: copied ? '#22c55e' : accentColor,
                color: accentColor === '#ffffff' && !copied ? '#000' : '#fff',
              }}
              data-testid="share-copy"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy link
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function generateShareUrl(state: ShareableState): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const encoded = btoa(JSON.stringify(state));
  return `${baseUrl}?state=${encoded}`;
}

export function parseShareState(url: string): ShareableState | null {
  try {
    const params = new URLSearchParams(new URL(url).search);
    const stateParam = params.get('state');
    if (!stateParam) return null;
    return JSON.parse(atob(stateParam)) as ShareableState;
  } catch {
    return null;
  }
}
