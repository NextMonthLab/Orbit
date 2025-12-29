import { useRoute, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Loader2, Mic, MicOff, Volume2, VolumeX, ChevronLeft, ChevronRight, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface OrbitBox {
  id: number;
  businessSlug: string;
  boxType: string;
  title: string;
  description: string | null;
  sourceUrl: string | null;
  content: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
}

interface OrbitResponse {
  status: "ready" | "generating" | "failed" | "idle";
  businessSlug: string;
  boxes?: OrbitBox[];
}

interface AskResponse {
  replyText: string;
  scenePatch?: { cardId: number; reason: string } | null;
  tokensUsed?: number;
  cardContext?: { id: number; title: string }[];
}

export default function KioskOrbitView() {
  const [matchedOrbit, orbitParams] = useRoute("/orbit/:slug");
  const [matchedO, oParams] = useRoute("/o/:slug");
  const slug = orbitParams?.slug || oParams?.slug;
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  const isKiosk = params.get('kiosk') === '1';
  const isVoice = params.get('voice') === '1';
  const deviceToken = params.get('token') || null;

  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(isVoice);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: orbitData, isLoading } = useQuery<OrbitResponse>({
    queryKey: ["orbit-kiosk", slug],
    queryFn: async () => {
      const response = await fetch(`/api/orbit/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch orbit");
      return response.json();
    },
    enabled: !!slug,
  });

  const visibleBoxes = (orbitData?.boxes || [])
    .filter(b => b.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 50);

  const currentBox = visibleBoxes[currentBoxIndex];

  const askMutation = useMutation({
    mutationFn: async (q: string): Promise<AskResponse> => {
      const response = await fetch(`/api/orbit/${slug}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          deviceToken,
          currentCardId: currentBox?.id,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get response');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.replyText }]);
      if (voiceEnabled && data.replyText) {
        speak(data.replyText);
      }
      if (data.scenePatch?.cardId) {
        const boxIndex = visibleBoxes.findIndex(b => b.id === data.scenePatch!.cardId);
        if (boxIndex >= 0) {
          setCurrentBoxIndex(boxIndex);
        }
      }
    },
  });

  const handleAsk = async () => {
    if (!question.trim() || isAsking) return;
    setIsAsking(true);
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    const q = question;
    setQuestion('');
    
    try {
      await askMutation.mutateAsync(q);
    } finally {
      setIsAsking(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setTimeout(() => {
          setQuestion(transcript);
          handleAsk();
        }, 100);
      };
      recognition.onerror = () => setIsListening(false);
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const goNext = () => {
    if (currentBoxIndex < visibleBoxes.length - 1) {
      setCurrentBoxIndex(currentBoxIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentBoxIndex > 0) {
      setCurrentBoxIndex(currentBoxIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-pink-400" />
      </div>
    );
  }

  if (!orbitData || orbitData.status !== 'ready') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Orbit Not Ready</h1>
          <p className="text-zinc-400 text-lg">This orbit is still being prepared.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-zinc-950 overflow-hidden select-none"
      style={{ touchAction: 'none' }}
      data-testid="kiosk-container"
    >
      {showChat ? (
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <Button
              variant="ghost"
              size="lg"
              className="text-white min-h-[64px] min-w-[64px]"
              onClick={() => setShowChat(false)}
              data-testid="button-close-chat"
            >
              <ChevronLeft className="w-8 h-8" />
              <span className="ml-2 text-lg">Back</span>
            </Button>
            
            {voiceEnabled && (
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  "min-h-[64px] min-w-[64px]",
                  isSpeaking ? "text-pink-400" : "text-zinc-400"
                )}
                onClick={isSpeaking ? stopSpeaking : () => {}}
                data-testid="button-toggle-speech"
              >
                {isSpeaking ? <Volume2 className="w-8 h-8" /> : <VolumeX className="w-8 h-8" />}
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
                <p className="text-2xl text-zinc-500">Ask me anything about this experience</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[80%] p-6 rounded-2xl text-xl leading-relaxed",
                  msg.role === 'user'
                    ? "ml-auto bg-pink-500/20 text-white"
                    : "mr-auto bg-zinc-800 text-zinc-100"
                )}
                data-testid={`message-${msg.role}-${i}`}
              >
                {msg.content}
              </div>
            ))}
            
            {isAsking && (
              <div className="mr-auto bg-zinc-800 p-6 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
          <div className="flex-shrink-0 p-6 bg-zinc-900 border-t border-zinc-800">
            <div className="flex gap-4">
              {voiceEnabled && (
                <Button
                  size="lg"
                  className={cn(
                    "min-h-[80px] min-w-[80px] rounded-full",
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                      : "bg-pink-500 hover:bg-pink-600"
                  )}
                  onClick={isListening ? stopListening : startListening}
                  data-testid="button-voice-input"
                >
                  {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                </Button>
              )}
              
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Type your question..."
                className="flex-1 min-h-[80px] text-2xl bg-zinc-800 border-zinc-700 text-white rounded-2xl px-6"
                data-testid="input-kiosk-question"
              />
              
              <Button
                size="lg"
                className="min-h-[80px] min-w-[80px] rounded-full bg-pink-500 hover:bg-pink-600"
                onClick={handleAsk}
                disabled={!question.trim() || isAsking}
                data-testid="button-send-question"
              >
                <Send className="w-10 h-10" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            {currentBox && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                data-testid={`box-content-${currentBox.id}`}
              >
                {currentBox.imageUrl && (
                  <img
                    src={currentBox.imageUrl}
                    alt={currentBox.title}
                    className="max-w-[60%] max-h-[40%] object-contain rounded-2xl mb-8 shadow-2xl"
                  />
                )}
                
                <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                  {currentBox.title}
                </h1>
                
                {currentBox.description && (
                  <p className="text-2xl text-zinc-300 max-w-4xl leading-relaxed">
                    {currentBox.description}
                  </p>
                )}
              </div>
            )}
            
            {visibleBoxes.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 min-h-[100px] min-w-[100px] rounded-full bg-zinc-800/50 hover:bg-zinc-700/50",
                    currentBoxIndex === 0 && "opacity-30 cursor-not-allowed"
                  )}
                  onClick={goPrev}
                  disabled={currentBoxIndex === 0}
                  data-testid="button-prev-box"
                >
                  <ChevronLeft className="w-12 h-12 text-white" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 min-h-[100px] min-w-[100px] rounded-full bg-zinc-800/50 hover:bg-zinc-700/50",
                    currentBoxIndex === visibleBoxes.length - 1 && "opacity-30 cursor-not-allowed"
                  )}
                  onClick={goNext}
                  disabled={currentBoxIndex === visibleBoxes.length - 1}
                  data-testid="button-next-box"
                >
                  <ChevronRight className="w-12 h-12 text-white" />
                </Button>
              </>
            )}
            
            {visibleBoxes.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {visibleBoxes.slice(0, 20).map((_, i) => (
                  <button
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-full transition-all",
                      i === currentBoxIndex ? "bg-pink-500 scale-125" : "bg-zinc-600"
                    )}
                    onClick={() => setCurrentBoxIndex(i)}
                    data-testid={`dot-${i}`}
                  />
                ))}
                {visibleBoxes.length > 20 && (
                  <span className="text-zinc-500 text-sm ml-2">+{visibleBoxes.length - 20}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 p-6 bg-zinc-900/80 backdrop-blur border-t border-zinc-800">
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="min-h-[80px] px-12 rounded-2xl bg-pink-500 hover:bg-pink-600 text-2xl font-semibold"
                onClick={() => setShowChat(true)}
                data-testid="button-open-chat"
              >
                <MessageCircle className="w-8 h-8 mr-4" />
                Ask a Question
              </Button>
              
              {voiceEnabled && (
                <Button
                  size="lg"
                  className={cn(
                    "min-h-[80px] min-w-[80px] rounded-2xl",
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                      : "bg-zinc-700 hover:bg-zinc-600"
                  )}
                  onClick={() => {
                    setShowChat(true);
                    setTimeout(startListening, 500);
                  }}
                  data-testid="button-voice-quick"
                >
                  <Mic className="w-10 h-10" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
