import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, X, Sparkles, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InteractivityNodeProps {
  nodeId: string;
  afterCardIndex: number;
  previewId: string;
  previewAccessToken?: string;
  isActive: boolean;
  onActivate: () => void;
  onRemove: () => void;
  characterName?: string;
}

export function InteractivityNode({
  nodeId,
  afterCardIndex,
  previewId,
  previewAccessToken,
  isActive,
  onActivate,
  onRemove,
  characterName = "AI Guide",
}: InteractivityNodeProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm here to help you explore this story. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !previewAccessToken) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/previews/${previewId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          previewAccessToken,
        }),
      });

      const data = await response.json();

      if (data.capped) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message || "This preview has reached its limit.",
          },
        ]);
      } else if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center py-2"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-full">
          <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-purple-300">AI Interaction</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onActivate}
            className="h-6 px-2 text-xs text-purple-300 hover:text-white hover:bg-purple-500/20"
            data-testid={`button-activate-node-${nodeId}`}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Try it
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-5 w-5 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
            data-testid={`button-remove-node-${nodeId}`}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="my-3"
    >
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-purple-200">
              {characterName}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              Live AI • Session only
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onActivate()}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            data-testid={`button-minimize-node-${nodeId}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div
          ref={scrollRef}
          className="h-48 overflow-y-auto p-3 space-y-3"
        >
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-slate-800 text-slate-400 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-3 border-t border-purple-500/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-800/50 border-slate-700 text-white text-sm h-9"
              disabled={isLoading || !previewAccessToken}
              data-testid={`input-node-message-${nodeId}`}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading || !previewAccessToken}
              className="h-9 px-3 bg-purple-600 hover:bg-purple-700"
              data-testid={`button-send-node-message-${nodeId}`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          {!previewAccessToken && (
            <p className="text-xs text-amber-400/70 mt-2 text-center">
              Reload preview to enable chat
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AddInteractivityButton({
  afterCardIndex,
  onAdd,
}: {
  afterCardIndex: number;
  onAdd: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative h-6 flex items-center justify-center group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onAdd}
      data-testid={`button-add-node-after-${afterCardIndex}`}
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <motion.button
        initial={false}
        animate={{
          scale: isHovered ? 1.1 : 1,
          backgroundColor: isHovered ? "rgb(147, 51, 234)" : "rgb(30, 41, 59)",
        }}
        className="relative z-10 w-6 h-6 rounded-full border border-purple-500/50 flex items-center justify-center transition-colors"
      >
        <Plus className={`w-3 h-3 ${isHovered ? "text-white" : "text-purple-400"}`} />
      </motion.button>
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-1/2 translate-x-4 text-xs text-purple-300 whitespace-nowrap bg-slate-900/90 px-2 py-1 rounded"
          >
            Add AI Interaction
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
