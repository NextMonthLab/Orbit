import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Film, 
  MessageCircle, 
  Image, 
  Video, 
  Music, 
  Mic, 
  Download, 
  Globe, 
  Loader2,
  Check,
  Sparkles
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewData {
  id: string;
  title: string;
  cards: Array<{ id: string; title: string; content: string; order: number }>;
}

interface MediaOptions {
  images: boolean;
  video: boolean;
  music: boolean;
  voiceover: boolean;
}

const MEDIA_PRICES = {
  images: 2.99,
  video: 4.99,
  music: 1.99,
  voiceover: 2.99,
};

const BASE_PRICE = 9.99;
const INTERACTIVITY_PRICE_PER_NODE = 0.99;

export default function IceCheckoutPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [mediaOptions, setMediaOptions] = useState<MediaOptions>({
    images: true,
    video: true,
    music: true,
    voiceover: true,
  });
  
  const [outputChoice, setOutputChoice] = useState<"download" | "publish" | null>(null);
  const [interactivityNodeCount, setInteractivityNodeCount] = useState(0);
  
  const { data: preview, isLoading } = useQuery({
    queryKey: ["/api/ice/preview", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/ice/preview/${params.id}`);
      if (!res.ok) throw new Error("Failed to load preview");
      return res.json() as Promise<PreviewData>;
    },
    enabled: !!params.id,
  });
  
  const cardCount = preview?.cards?.length || 0;
  
  const calculateTotal = () => {
    let total = BASE_PRICE;
    
    if (mediaOptions.images) total += MEDIA_PRICES.images * cardCount;
    if (mediaOptions.video) total += MEDIA_PRICES.video * cardCount;
    if (mediaOptions.music) total += MEDIA_PRICES.music;
    if (mediaOptions.voiceover) total += MEDIA_PRICES.voiceover * cardCount;
    
    if (outputChoice === "publish") {
      total += interactivityNodeCount * INTERACTIVITY_PRICE_PER_NODE;
    }
    
    return total;
  };
  
  const toggleMedia = (key: keyof MediaOptions) => {
    setMediaOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previewId: params.id,
          mediaOptions,
          outputChoice,
          interactivityNodeCount,
        }),
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to create checkout session");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  if (!user) {
    navigate(`/login?return=${encodeURIComponent(`/ice/preview/${params.id}/checkout`)}`);
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <GlobalNav />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/ice/preview/${params.id}`)}
          className="mb-6 text-slate-400 hover:text-white"
          data-testid="button-back-to-preview"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Preview
        </Button>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Production Manifest</h1>
            <p className="text-slate-400">
              Review what you're creating and customize your experience.
            </p>
          </div>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" />
                Your Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center">
                    <Film className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{preview?.title || "Your Story"}</p>
                    <p className="text-xs text-slate-500">{cardCount} story cards</p>
                  </div>
                </div>
                <span className="text-slate-400">${BASE_PRICE.toFixed(2)}</span>
              </div>
              
              {interactivityNodeCount > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-900/50 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">AI Interactions</p>
                      <p className="text-xs text-slate-500">{interactivityNodeCount} nodes</p>
                    </div>
                  </div>
                  <span className="text-slate-400">
                    ${(interactivityNodeCount * INTERACTIVITY_PRICE_PER_NODE).toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Media Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "images" as const, icon: Image, label: "AI Images", desc: "Generate unique images for each card" },
                { key: "video" as const, icon: Video, label: "Video Clips", desc: "Create animated video sequences" },
                { key: "music" as const, icon: Music, label: "Background Music", desc: "Add atmospheric soundtrack" },
                { key: "voiceover" as const, icon: Mic, label: "Voiceover", desc: "AI-generated narration" },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      ${key === "music" 
                        ? MEDIA_PRICES[key].toFixed(2) 
                        : (MEDIA_PRICES[key] * cardCount).toFixed(2)
                      }
                    </span>
                    <Switch
                      checked={mediaOptions[key]}
                      onCheckedChange={() => toggleMedia(key)}
                      data-testid={`switch-${key}`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Choose Your Output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => setOutputChoice("download")}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  outputChoice === "download"
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
                data-testid="option-download"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    outputChoice === "download" ? "bg-purple-600" : "bg-slate-700"
                  }`}>
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">Download</p>
                      {outputChoice === "download" && (
                        <Check className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Get a video file of your story. Perfect for social media, presentations, or embedding on your website.
                    </p>
                    <p className="text-xs text-amber-400/70 mt-2">
                      No AI interactivity in downloaded files
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setOutputChoice("publish")}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  outputChoice === "publish"
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
                data-testid="option-publish"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    outputChoice === "publish" ? "bg-purple-600" : "bg-slate-700"
                  }`}>
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">Publish</p>
                      {outputChoice === "publish" && (
                        <Check className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Host an interactive experience with live AI characters. Your audience can have real conversations.
                    </p>
                    <p className="text-xs text-green-400/70 mt-2">
                      Includes AI interactivity • Requires subscription
                    </p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-white">Total</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={calculateTotal()}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-2xl font-bold text-white"
                  >
                    ${calculateTotal().toFixed(2)}
                  </motion.span>
                </AnimatePresence>
              </div>
              
              <Button
                onClick={() => checkoutMutation.mutate()}
                disabled={!outputChoice || checkoutMutation.isPending}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-semibold"
                data-testid="button-proceed-to-payment"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
              
              {!outputChoice && (
                <p className="text-xs text-center text-amber-400/70 mt-3">
                  Please select Download or Publish above
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
