import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Clock, Sparkles, Archive } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewInstance {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  status: 'active' | 'archived' | 'claimed';
  siteTitle: string | null;
  siteSummary: string | null;
  keyServices: string[] | null;
  messageCount: number;
  maxMessages: number;
  expiresAt: string;
  createdAt: string;
}

interface ChatMessage {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

export default function PreviewPage() {
  const [, params] = useRoute("/preview/:id");
  const previewId = params?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ["preview", previewId],
    queryFn: async () => {
      const response = await fetch(`/api/previews/${previewId}`);
      if (!response.ok) throw new Error("Preview not found");
      return response.json() as Promise<PreviewInstance>;
    },
    enabled: !!previewId,
    refetchInterval: 30000, // Refetch every 30s to update message count and expiry
  });

  const { data: chatMessages } = useQuery({
    queryKey: ["preview-messages", previewId],
    queryFn: async () => {
      const response = await fetch(`/api/previews/${previewId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<ChatMessage[]>;
    },
    enabled: !!previewId && !!preview,
  });

  useEffect(() => {
    if (chatMessages && !hasInitialized) {
      if (chatMessages.length > 0) {
        setMessages(chatMessages);
      } else if (preview) {
        // Initial greeting
        setMessages([{
          id: 0,
          role: "assistant",
          content: preview.siteSummary || `Welcome! I'm here to answer questions about ${preview.siteTitle || preview.sourceDomain}.`,
          createdAt: new Date().toISOString(),
        }]);
      }
      setHasInitialized(true);
    }
  }, [chatMessages, preview, hasInitialized]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch(`/api/previews/${previewId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          throw new Error("MESSAGE_CAP_REACHED");
        }
        throw new Error(error.message || "Failed to send message");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      }]);
    },
    onError: (error: Error) => {
      setIsTyping(false);
      if (error.message === "MESSAGE_CAP_REACHED") {
        setShowPaywall(true);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content: `Something went wrong. Please try again.`,
          createdAt: new Date().toISOString(),
        }]);
      }
    },
  });

  const handleSend = (message?: string) => {
    const messageToSend = message || input.trim();
    if (!messageToSend || isTyping) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      role: "user",
      content: messageToSend,
      createdAt: new Date().toISOString(),
    }]);
    setInput("");
    setIsTyping(true);

    sendMutation.mutate(messageToSend);
  };

  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/previews/${previewId}/claim`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error("Failed to initiate claim");
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/previews/${previewId}/archive`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error("Failed to archive");
      return response.json();
    },
    onSuccess: () => {
      setShowPaywall(false);
      window.location.href = "/";
    },
  });

  const getTimeRemaining = () => {
    if (!preview) return "";
    const now = new Date();
    const expires = new Date(preview.expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours <= 0 && diffMins <= 0) return "Expired";
    if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
    return `${diffMins}m`;
  };

  const suggestedPrompts = [
    "What do you do better than competitors?",
    "How would you qualify a new lead?",
    "What do customers usually ask before buying?"
  ];

  if (previewLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-display font-bold mb-4">Preview Not Found</h2>
        <p className="text-muted-foreground mb-6">This preview may have expired or been archived.</p>
        <Button onClick={() => window.location.href = "/"}>Go Home</Button>
      </div>
    );
  }

  if (preview.status === 'archived') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <Archive className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-4">Preview Archived</h2>
        <p className="text-muted-foreground mb-6">This preview has been archived and is no longer available.</p>
        <Button onClick={() => window.location.href = "/"}>Go Home</Button>
      </div>
    );
  }

  if (preview.status === 'claimed') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-display font-bold mb-4">Preview Claimed!</h2>
        <p className="text-muted-foreground mb-6">This preview has been claimed and is now a full Smart Site.</p>
        <Button onClick={() => window.location.href = "/"}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-4xl mx-auto border-x border-border shadow-2xl relative">
      {/* Header with branding and preview badge */}
      <div className="p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold leading-tight">
              {preview.siteTitle || preview.sourceDomain}
            </h1>
            <p className="text-xs text-muted-foreground">{preview.sourceDomain}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Preview Mode</span>
          </div>
        </div>

        {/* Expiry timer */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Preview expires in {getTimeRemaining()} unless claimed</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Guided Tour Panel */}
        <aside className="md:w-72 border-b md:border-b-0 md:border-r border-border bg-secondary/5 p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Try asking...
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Click a question to get started
            </p>
          </div>

          <div className="space-y-2">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent/10 hover:border-primary/30 transition-all text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {prompt}
                </p>
              </button>
            ))}
          </div>

          {preview.keyServices && preview.keyServices.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                Key Services
              </h3>
              <ul className="space-y-1">
                {preview.keyServices.map((service, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              Messages: {preview.messageCount} / {preview.maxMessages}
            </p>
            <Button
              onClick={() => setShowPaywall(true)}
              className="w-full"
              size="sm"
            >
              Claim and Activate
            </Button>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 max-w-2xl mx-auto pb-4">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_4px_20px_rgba(124,58,237,0.2)]'
                      : 'bg-secondary/80 text-secondary-foreground rounded-tl-sm border border-border'}
                  `}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-sm border border-border flex gap-1 items-center h-[44px]">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-2xl mx-auto flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="bg-secondary/50 border-border focus-visible:ring-primary/50 h-12 rounded-full px-6 shadow-inner"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isTyping || preview.messageCount >= preview.maxMessages}
              />
              <Button
                onClick={() => handleSend()}
                size="icon"
                className="shrink-0 h-12 w-12 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                disabled={isTyping || !input.trim() || preview.messageCount >= preview.maxMessages}
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
              </Button>
            </div>
            {preview.messageCount >= preview.maxMessages && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Message limit reached. <button onClick={() => setShowPaywall(true)} className="text-primary underline">Claim this preview</button> to continue.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Your Smart Site is ready</DialogTitle>
            <DialogDescription className="text-base pt-2">
              To keep it live and claim the leads it is already uncovering, activate it.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>Unlimited conversations with potential customers</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>Full site content and intelligent responses</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>Lead capture and conversation history</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="w-full"
              size="lg"
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Claim and activate
            </Button>
            <Button
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              Not now, archive this preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
