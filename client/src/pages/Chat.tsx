import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocation, Link } from "wouter";

export default function Chat() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const characterId = searchParams.get('character');

  const { data: character, isLoading } = useQuery({
    queryKey: ["character", characterId],
    queryFn: () => api.getCharacter(parseInt(characterId!)),
    enabled: !!characterId,
  });

  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (character && !hasStarted) {
      setMessages([{
        role: "assistant",
        content: character.description || `Hello, I'm ${character.name}. What would you like to know?`
      }]);
      setHasStarted(true);
    }
  }, [character, hasStarted]);

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

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = { role: "user", content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: character?.systemPrompt 
          ? `As ${character.name}, I have my own perspective on that...`
          : "I can't discuss that right now. Perhaps ask me something else?"
      }]);
    }, 1500);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!characterId || !character) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <h2 className="text-2xl font-display font-bold mb-4">No Character Selected</h2>
          <p className="text-muted-foreground mb-6">Select a character to chat with from a story card.</p>
          <Link href="/today">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to Today's Story
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-65px)] md:h-screen bg-background relative overflow-hidden">
        
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-card/80 backdrop-blur-md flex items-center gap-4 sticky top-0 z-10">
          <Link href="/today">
            <Button variant="ghost" size="icon" className="mr-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <AvatarImage src={character.avatar || undefined} className="object-cover" />
              <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg leading-none tracking-wide" data-testid="chat-character-name">
              {character.name}
            </h2>
            <span className="text-xs text-primary font-medium tracking-wider uppercase">
              {character.role || 'Character'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 max-w-2xl mx-auto pb-4">
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative
                  ${msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_4px_20px_rgba(124,58,237,0.2)]' 
                    : 'bg-secondary/80 text-secondary-foreground rounded-tl-sm border border-white/5'}
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
                <div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex gap-1 items-center h-[44px]">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-background/80 backdrop-blur-md">
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="bg-secondary/50 border-white/10 focus-visible:ring-primary/50 h-12 rounded-full px-6 shadow-inner"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              data-testid="input-chat-message"
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="shrink-0 h-12 w-12 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]"
              data-testid="button-send-message"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-3 font-mono tracking-widest opacity-50">
            ENCRYPTED CONNECTION // MESSAGES: {messages.length}/10
          </p>
        </div>

      </div>
    </Layout>
  );
}
