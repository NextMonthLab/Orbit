import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Image, Video, Mic, Upload, Loader2, Play, Pause, RefreshCw, 
  Save, Trash2, Lock, Sparkles, Crown, Wand2, Volume2, X,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewCard {
  id: string;
  title: string;
  content: string;
  order: number;
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
  narrationAudioUrl?: string;
}

interface Entitlements {
  canGenerateImages: boolean;
  canGenerateVideos: boolean;
  canUseCloudLlm: boolean;
  canUploadAudio: boolean;
  planName: string;
  tier: string;
}

interface IceCardEditorProps {
  previewId: string;
  card: PreviewCard;
  cardIndex: number;
  entitlements: Entitlements | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCardUpdate: (cardId: string, updates: Partial<PreviewCard>) => void;
  onCardSave: (cardId: string, updates: Partial<PreviewCard>) => void;
  onUpgradeClick: () => void;
}

function LockedOverlay({ 
  feature, 
  description, 
  onUpgrade 
}: { 
  feature: string; 
  description: string; 
  onUpgrade: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 z-10">
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full p-3 mb-3">
        <Lock className="w-6 h-6 text-purple-400" />
      </div>
      <h4 className="text-white font-semibold mb-1">{feature}</h4>
      <p className="text-slate-400 text-sm text-center mb-4 max-w-xs">{description}</p>
      <Button
        onClick={onUpgrade}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
        size="sm"
      >
        <Crown className="w-4 h-4" />
        Upgrade to Unlock
      </Button>
    </div>
  );
}

export function IceCardEditor({
  previewId,
  card,
  cardIndex,
  entitlements,
  isExpanded,
  onToggleExpand,
  onCardUpdate,
  onCardSave,
  onUpgradeClick,
}: IceCardEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const canGenerateImages = entitlements?.canGenerateImages ?? false;
  const canGenerateVideos = entitlements?.canGenerateVideos ?? false;
  const canGenerateVoiceover = entitlements?.canUploadAudio ?? false;
  const isPro = entitlements && entitlements.tier !== "free";
  
  const [activeTab, setActiveTab] = useState<"content" | "image" | "video" | "narration">("content");
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedContent, setEditedContent] = useState(card.content);
  
  useEffect(() => {
    setEditedTitle(card.title);
    setEditedContent(card.content);
  }, [card.title, card.content]);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [videoMode, setVideoMode] = useState<"text-to-video" | "image-to-video">("text-to-video");
  const [videoModel, setVideoModel] = useState("");
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoGenElapsed, setVideoGenElapsed] = useState(0);
  const [videoGenStartTime, setVideoGenStartTime] = useState<number | null>(null);
  
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [narrationText, setNarrationText] = useState(card.content || "");
  const [narrationVoice, setNarrationVoice] = useState("alloy");
  const [narrationSpeed, setNarrationSpeed] = useState(1.0);
  const [narrationLoading, setNarrationLoading] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { data: videoConfig } = useQuery({
    queryKey: ["video-config"],
    queryFn: async () => {
      const res = await fetch("/api/video/config");
      if (!res.ok) return { configured: false, models: [] };
      return res.json();
    },
  });
  
  const { data: voicesData } = useQuery({
    queryKey: ["tts-voices"],
    queryFn: async () => {
      const res = await fetch("/api/tts/voices");
      if (!res.ok) return { configured: false, voices: [] };
      return res.json();
    },
  });
  
  useEffect(() => {
    if (videoConfig?.models?.length > 0 && !videoModel) {
      setVideoModel(videoConfig.models[0].id);
    }
  }, [videoConfig, videoModel]);
  
  useEffect(() => {
    if (videoStatus === "processing" || videoStatus === "pending") {
      if (!videoGenStartTime) {
        setVideoGenStartTime(Date.now());
      }
      const interval = setInterval(() => {
        setVideoGenElapsed(Math.floor((Date.now() - (videoGenStartTime || Date.now())) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setVideoGenStartTime(null);
      setVideoGenElapsed(0);
    }
  }, [videoStatus, videoGenStartTime]);
  
  const handleGenerateImage = async () => {
    if (!canGenerateImages) {
      onUpgradeClick();
      return;
    }
    
    setImageLoading(true);
    try {
      const prompt = imagePrompt || `${card.title}. ${card.content}`;
      const res = await fetch(`/api/ice/preview/${previewId}/cards/${card.id}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        if (err.upgradeRequired) {
          onUpgradeClick();
          return;
        }
        throw new Error(err.message || "Failed to generate image");
      }
      
      const data = await res.json();
      onCardUpdate(card.id, { generatedImageUrl: data.imageUrl });
      toast({ title: "Image generated!", description: "AI image has been created for this card." });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setImageLoading(false);
    }
  };
  
  const handleGenerateVideo = async () => {
    if (!canGenerateVideos) {
      onUpgradeClick();
      return;
    }
    
    setVideoLoading(true);
    setVideoStatus("pending");
    setVideoGenStartTime(Date.now());
    
    try {
      const res = await fetch(`/api/ice/preview/${previewId}/cards/${card.id}/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mode: videoMode,
          model: videoModel,
          duration: videoDuration,
          sourceImageUrl: videoMode === "image-to-video" ? card.generatedImageUrl : undefined,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        if (err.upgradeRequired) {
          onUpgradeClick();
          return;
        }
        throw new Error(err.message || "Failed to generate video");
      }
      
      const data = await res.json();
      if (data.status === "completed") {
        setVideoStatus("completed");
        onCardUpdate(card.id, { generatedVideoUrl: data.videoUrl });
        toast({ title: "Video ready!", description: "AI video has been generated." });
      } else {
        setVideoStatus("processing");
        toast({ title: "Video generation started", description: "This may take 5-10 minutes." });
      }
    } catch (error: any) {
      setVideoStatus("failed");
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setVideoLoading(false);
    }
  };
  
  const handlePreviewNarration = async () => {
    if (previewPlaying && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setPreviewPlaying(false);
      return;
    }
    
    const text = narrationText.slice(0, 300);
    if (!text.trim()) {
      toast({ title: "No text to preview", variant: "destructive" });
      return;
    }
    
    try {
      setPreviewPlaying(true);
      const res = await fetch(`/api/ice/preview/${previewId}/cards/${card.id}/narration/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text,
          voice: narrationVoice,
          speed: narrationSpeed,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Preview failed");
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.onended = () => {
        setPreviewPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.play();
    } catch (error: any) {
      setPreviewPlaying(false);
      toast({ title: "Preview failed", description: error.message, variant: "destructive" });
    }
  };
  
  const handleGenerateNarration = async () => {
    if (!canGenerateVoiceover) {
      onUpgradeClick();
      return;
    }
    
    setNarrationLoading(true);
    try {
      const res = await fetch(`/api/ice/preview/${previewId}/cards/${card.id}/narration/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: narrationText,
          voice: narrationVoice,
          speed: narrationSpeed,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        if (err.upgradeRequired) {
          onUpgradeClick();
          return;
        }
        throw new Error(err.message || "Failed to generate narration");
      }
      
      const data = await res.json();
      onCardUpdate(card.id, { narrationAudioUrl: data.audioUrl });
      toast({ title: "Narration generated!", description: "AI voiceover has been created." });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setNarrationLoading(false);
    }
  };
  
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/80">
      <div 
        className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
          isExpanded ? "bg-purple-900/30 border-b border-purple-500/30" : "hover:bg-slate-800/50"
        }`}
        onClick={onToggleExpand}
        data-testid={`card-editor-header-${cardIndex}`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm ${
          isExpanded ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
        }`}>
          {String(cardIndex + 1).padStart(2, '0')}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{card.title || "Untitled Card"}</h3>
          <p className="text-sm text-slate-400 truncate">{card.content?.slice(0, 60) || "No content"}...</p>
        </div>
        <div className="flex items-center gap-2">
          {card.generatedImageUrl && (
            <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center" title="Has image">
              <Image className="w-3 h-3 text-green-400" />
            </div>
          )}
          {card.generatedVideoUrl && (
            <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center" title="Has video">
              <Video className="w-3 h-3 text-blue-400" />
            </div>
          )}
          {card.narrationAudioUrl && (
            <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center" title="Has narration">
              <Mic className="w-3 h-3 text-purple-400" />
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 space-y-4">
              <div className="flex gap-2 border-b border-slate-700 pb-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    activeTab === "content" 
                      ? "bg-purple-600 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  data-testid="tab-content"
                >
                  <Wand2 className="w-4 h-4" />
                  Content
                </button>
                <button
                  onClick={() => setActiveTab("image")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    activeTab === "image" 
                      ? "bg-purple-600 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  data-testid="tab-image-gen"
                >
                  <Image className="w-4 h-4" />
                  AI Image
                  {!canGenerateImages && <Lock className="w-3 h-3 ml-1 text-yellow-400" />}
                </button>
                <button
                  onClick={() => setActiveTab("video")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    activeTab === "video" 
                      ? "bg-purple-600 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  data-testid="tab-video-gen"
                >
                  <Video className="w-4 h-4" />
                  AI Video
                  {!canGenerateVideos && <Lock className="w-3 h-3 ml-1 text-yellow-400" />}
                </button>
                <button
                  onClick={() => setActiveTab("narration")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "narration" 
                      ? "bg-purple-600 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  data-testid="tab-narration"
                >
                  <Mic className="w-4 h-4" />
                  Narration
                  {!canGenerateVoiceover && <Lock className="w-3 h-3 ml-1 text-yellow-400" />}
                </button>
              </div>
              
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Card Title</Label>
                    <Input
                      value={editedTitle}
                      onChange={(e) => {
                        setEditedTitle(e.target.value);
                        onCardUpdate(card.id, { title: e.target.value });
                      }}
                      onBlur={() => onCardSave(card.id, { title: editedTitle, content: editedContent })}
                      placeholder="Enter card title..."
                      className="bg-slate-800 border-slate-700 text-white font-semibold"
                      data-testid="input-card-title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Card Content</Label>
                    <Textarea
                      value={editedContent}
                      onChange={(e) => {
                        setEditedContent(e.target.value);
                        onCardUpdate(card.id, { content: e.target.value });
                      }}
                      onBlur={() => onCardSave(card.id, { title: editedTitle, content: editedContent })}
                      placeholder="Enter card content..."
                      rows={5}
                      className="bg-slate-800 border-slate-700 text-white"
                      data-testid="input-card-content"
                    />
                  </div>
                  
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-400">
                      This content will be used to generate AI images, videos, and narration for this card.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === "image" && (
                <div className="relative space-y-4">
                  {!canGenerateImages && (
                    <LockedOverlay
                      feature="AI Image Generation"
                      description="Generate stunning AI images for your story cards with a Pro subscription."
                      onUpgrade={onUpgradeClick}
                    />
                  )}
                  
                  {card.generatedImageUrl && (
                    <div className="rounded-lg overflow-hidden border border-green-500/30 bg-green-500/5">
                      <div className="p-2 bg-green-500/10 flex items-center justify-between">
                        <span className="text-sm font-medium text-green-400">Generated Image</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => onCardUpdate(card.id, { generatedImageUrl: undefined })}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <img 
                        src={card.generatedImageUrl} 
                        alt={card.title}
                        className="w-full max-h-64 object-contain bg-black"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Image Prompt</Label>
                    <Textarea
                      placeholder={`Auto-generated from card content: "${card.title}. ${card.content?.slice(0, 100)}..."`}
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={3}
                      className="bg-slate-800 border-slate-700 text-white"
                      data-testid="input-image-prompt"
                    />
                    <p className="text-xs text-slate-500">
                      Leave empty to auto-generate from card content
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleGenerateImage}
                    disabled={imageLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                    data-testid="button-generate-image"
                  >
                    {imageLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    {imageLoading ? "Generating..." : "Generate AI Image"}
                  </Button>
                </div>
              )}
              
              {activeTab === "video" && (
                <div className="relative space-y-4">
                  {!canGenerateVideos && (
                    <LockedOverlay
                      feature="AI Video Generation"
                      description="Create cinematic AI videos from your story cards with a Business subscription."
                      onUpgrade={onUpgradeClick}
                    />
                  )}
                  
                  {card.generatedVideoUrl && (
                    <div className="rounded-lg overflow-hidden border border-blue-500/30 bg-blue-500/5">
                      <div className="p-2 bg-blue-500/10 flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-400">Generated Video</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => onCardUpdate(card.id, { generatedVideoUrl: undefined })}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <video 
                        src={card.generatedVideoUrl}
                        controls
                        className="w-full bg-black"
                        data-testid="video-preview"
                      />
                    </div>
                  )}
                  
                  {!videoConfig?.configured ? (
                    <div className="p-4 bg-slate-800 rounded-lg text-sm text-slate-400">
                      Video generation is not configured. Contact support to enable AI video generation.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Mode</Label>
                          <Select value={videoMode} onValueChange={(v) => setVideoMode(v as any)}>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text-to-video">Text to Video</SelectItem>
                              <SelectItem value="image-to-video" disabled={!card.generatedImageUrl}>
                                Image to Video
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-slate-300">Model</Label>
                          <Select value={videoModel} onValueChange={setVideoModel}>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {videoConfig?.models?.map((m: any) => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-slate-300">Duration</Label>
                          <Select value={String(videoDuration)} onValueChange={(v) => setVideoDuration(parseInt(v) as any)}>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 seconds</SelectItem>
                              <SelectItem value="10">10 seconds</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {videoStatus === "processing" && (
                        <div className="p-3 bg-slate-800 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                              Generating video...
                            </span>
                            <span className="text-sm font-mono text-slate-400">
                              {Math.floor(videoGenElapsed / 60)}:{(videoGenElapsed % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <Progress value={Math.min(95, (videoGenElapsed / 600) * 100)} className="h-2" />
                          <p className="text-xs text-slate-500">Typically completes in 5-10 minutes</p>
                        </div>
                      )}
                      
                      <Button
                        onClick={handleGenerateVideo}
                        disabled={videoLoading || videoStatus === "processing"}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2"
                        data-testid="button-generate-video"
                      >
                        {videoLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Video className="w-4 h-4" />
                        )}
                        {videoLoading ? "Starting..." : "Generate AI Video"}
                      </Button>
                    </>
                  )}
                </div>
              )}
              
              {activeTab === "narration" && (
                <div className="relative space-y-4">
                  {!canGenerateVoiceover && (
                    <LockedOverlay
                      feature="AI Narration"
                      description="Add professional AI voiceover to your story cards with a Pro subscription."
                      onUpgrade={onUpgradeClick}
                    />
                  )}
                  
                  {card.narrationAudioUrl && (
                    <div className="rounded-lg overflow-hidden border border-purple-500/30 bg-purple-500/5">
                      <div className="p-2 bg-purple-500/10 flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-400">Generated Narration</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => onCardUpdate(card.id, { narrationAudioUrl: undefined })}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <div className="p-3">
                        <audio 
                          src={card.narrationAudioUrl} 
                          controls 
                          className="w-full h-10"
                          data-testid="audio-preview"
                        />
                      </div>
                    </div>
                  )}
                  
                  {!voicesData?.configured ? (
                    <div className="p-4 bg-slate-800 rounded-lg text-sm text-slate-400">
                      TTS is not configured. Contact support to enable AI narration.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Narration Text</Label>
                        <Textarea
                          placeholder="Enter the text to be narrated..."
                          value={narrationText}
                          onChange={(e) => setNarrationText(e.target.value)}
                          rows={4}
                          className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                          data-testid="input-narration-text"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{narrationText.length} / 3000 characters</span>
                          {narrationText.length > 3000 && (
                            <span className="text-red-400">Exceeds limit</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Voice</Label>
                          <Select value={narrationVoice} onValueChange={setNarrationVoice}>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {voicesData?.voices?.map((voice: any) => (
                                <SelectItem key={voice.id} value={voice.id}>
                                  {voice.name} - {voice.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-slate-300">Speed: {narrationSpeed.toFixed(1)}x</Label>
                          <Slider
                            value={[narrationSpeed]}
                            onValueChange={([v]) => setNarrationSpeed(v)}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            className="mt-3"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handlePreviewNarration}
                          disabled={!narrationText.trim()}
                          className="gap-2 border-slate-600"
                          data-testid="button-preview-narration"
                        >
                          {previewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {previewPlaying ? "Stop" : "Preview"}
                        </Button>
                        
                        <Button
                          onClick={handleGenerateNarration}
                          disabled={narrationLoading || !narrationText.trim() || narrationText.length > 3000}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                          data-testid="button-generate-narration"
                        >
                          {narrationLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                          {narrationLoading ? "Generating..." : "Generate Narration"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IceCardEditor;
