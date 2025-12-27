import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Video, Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VideoReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  prefillQuestion?: string;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export function VideoReplyModal({ 
  isOpen, 
  onClose, 
  brandName,
  prefillQuestion = '',
  accentColor = '#ffffff', 
  theme = 'dark' 
}: VideoReplyModalProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [question, setQuestion] = useState(prefillQuestion);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const inputBg = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  
  const handleSubmit = async () => {
    if (!contact.trim() || !question.trim()) return;
    
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const event = {
      type: 'video_reply_requested',
      timestamp: Date.now(),
      data: { name, contact, question },
    };
    const existing = JSON.parse(localStorage.getItem('sessionEvents') || '[]');
    localStorage.setItem('sessionEvents', JSON.stringify([...existing, event]));
    
    setSubmitting(false);
    setSubmitted(true);
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
          data-testid="video-reply-modal"
        >
          <div 
            className="flex items-center justify-between p-4"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5" style={{ color: accentColor }} />
              <span className="font-semibold" style={{ color: textColor }}>Request a video reply</span>
            </div>
            <button onClick={onClose} style={{ color: mutedColor }} data-testid="video-reply-close">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {submitted ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>Request sent!</h3>
              <p className="text-sm" style={{ color: mutedColor }}>
                {brandName} will send you a personal video response soon.
              </p>
              <Button onClick={onClose} className="mt-6" style={{ background: accentColor }}>
                Close
              </Button>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                Get a personal video response from {brandName}. We'll reply within 24 hours.
              </p>
              
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: mutedColor }}>
                  Your name (optional)
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                  data-testid="video-reply-name"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: mutedColor }}>
                  Email or phone *
                </label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                  data-testid="video-reply-contact"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: mutedColor }}>
                  Your question *
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to know?"
                  rows={3}
                  className="w-full rounded-lg p-3 text-sm resize-none"
                  style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                  data-testid="video-reply-question"
                />
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={submitting || !contact.trim() || !question.trim()}
                className="w-full"
                style={{ 
                  background: accentColor,
                  color: accentColor === '#ffffff' ? '#000' : '#fff',
                }}
                data-testid="video-reply-submit"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {submitting ? 'Sending...' : 'Request video reply'}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFallback: () => void;
  available: boolean;
  brandName: string;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export function VideoCallModal({ 
  isOpen, 
  onClose, 
  onFallback,
  available,
  brandName,
  accentColor = '#ffffff', 
  theme = 'dark' 
}: VideoCallModalProps) {
  const [connecting, setConnecting] = useState(true);
  
  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  useState(() => {
    if (isOpen && !available) {
      const timer = setTimeout(() => setConnecting(false), 2000);
      return () => clearTimeout(timer);
    }
  });
  
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
          style={{ background: 'rgba(0,0,0,0.9)' }}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-2xl overflow-hidden text-center p-8"
          style={{ background: bgColor, border: `1px solid ${borderColor}` }}
          data-testid="video-call-modal"
        >
          {connecting ? (
            <>
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: `${accentColor}20` }}
              >
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                Connecting...
              </h3>
              <p className="text-sm" style={{ color: mutedColor }}>
                Looking for someone at {brandName}
              </p>
            </>
          ) : (
            <>
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.2)' }}
              >
                <Video className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                No one available
              </h3>
              <p className="text-sm mb-6" style={{ color: mutedColor }}>
                No one from {brandName} is available right now. Would you like a video reply instead?
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => { onClose(); onFallback(); }}
                  className="w-full"
                  style={{ background: accentColor, color: accentColor === '#ffffff' ? '#000' : '#fff' }}
                  data-testid="video-call-fallback"
                >
                  Request video reply instead
                </Button>
                <Button onClick={onClose} variant="ghost" className="w-full" data-testid="video-call-close">
                  Close
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
