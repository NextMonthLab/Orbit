import Layout from "@/components/Layout";
import { MOCK_CHARACTERS } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const character = MOCK_CHARACTERS[0];
  const [messages, setMessages] = useState([
    { role: "assistant", content: "So... you found the package. Clever. Now tell me, did you open it?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    setMessages([...messages, newMsg]);
    setInput("");
    setIsTyping(true);

    // Fake response
    setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
            role: "assistant", 
            content: "I can't talk about that yet. Wait until tomorrow. The streets have ears." 
        }]);
    }, 2000);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-65px)] md:h-screen bg-background relative overflow-hidden">
        
        {/* Background texture for chat */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-card/80 backdrop-blur-md flex items-center gap-4 sticky top-0 z-10">
             <div className="relative">
                 <Avatar className="h-12 w-12 ring-2 ring-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    <AvatarImage src={character.avatar} className="object-cover" />
                    <AvatarFallback>V</AvatarFallback>
                 </Avatar>
                 <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
             </div>
             <div>
                <h2 className="font-display font-bold text-lg leading-none tracking-wide">{character.name}</h2>
                <span className="text-xs text-primary font-medium tracking-wider uppercase">{character.role}</span>
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
                />
                <Button onClick={handleSend} size="icon" className="shrink-0 h-12 w-12 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                    <Send className="w-5 h-5 ml-0.5" />
                </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3 font-mono tracking-widest opacity-50">
                ENCRYPTED CONNECTION // MESSAGES: 8/10
            </p>
        </div>

      </div>
    </Layout>
  );
}
