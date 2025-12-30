import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Sparkles, Globe, FileText, ArrowRight, Loader2, GripVertical, Lock, Play, Image, Mic, Upload, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import GlobalNav from "@/components/GlobalNav";
import { VisibilityBadge } from "@/components/VisibilityBadge";
import { motion, AnimatePresence } from "framer-motion";

const CREATION_STAGES = [
  { id: "fetch", label: "Fetching your content", duration: 1500 },
  { id: "analyze", label: "Analyzing structure and themes", duration: 2000 },
  { id: "extract", label: "Extracting key moments", duration: 2500 },
  { id: "craft", label: "Crafting your story cards", duration: 2000 },
  { id: "polish", label: "Adding the finishing touches", duration: 1500 },
];

interface PreviewCard {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface PreviewData {
  id: string;
  title: string;
  cards: PreviewCard[];
  sourceType: string;
  sourceValue: string;
  status?: string;
  createdAt: string;
}

export default function GuestIceBuilderPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const previewIdFromUrl = params.id;
  const { toast } = useToast();
  const { user } = useAuth();
  const [inputType, setInputType] = useState<"url" | "text" | "file">("url");
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [cards, setCards] = useState<PreviewCard[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [currentStage, setCurrentStage] = useState(-1);
  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-advance through visual stages during creation
  useEffect(() => {
    if (currentStage >= 0 && currentStage < CREATION_STAGES.length - 1) {
      stageTimerRef.current = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, CREATION_STAGES[currentStage].duration);
    }
    return () => {
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    };
  }, [currentStage]);
  
  const { data: existingPreview, isLoading: loadingExisting } = useQuery({
    queryKey: ["/api/ice/preview", previewIdFromUrl],
    queryFn: async () => {
      if (!previewIdFromUrl) return null;
      const res = await fetch(`/api/ice/preview/${previewIdFromUrl}`);
      if (!res.ok) {
        if (res.status === 410) throw new Error("This preview has expired");
        if (res.status === 404) throw new Error("Preview not found");
        throw new Error("Failed to load preview");
      }
      return res.json();
    },
    enabled: !!previewIdFromUrl,
    retry: false,
  });
  
  useEffect(() => {
    if (existingPreview) {
      setPreview(existingPreview);
      setCards(existingPreview.cards);
    }
  }, [existingPreview]);

  const createPreviewMutation = useMutation({
    mutationFn: async (data: { type: string; value: string }) => {
      setCurrentStage(0); // Start the visual stages
      const res = await apiRequest("POST", "/api/ice/preview", data);
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentStage(-1); // Reset stages
      setPreview(data);
      setCards(data.cards);
      toast({ title: "Preview created!", description: "You can now edit and reorder your story cards." });
      navigate(`/ice/preview/${data.id}`, { replace: true });
    },
    onError: (error: Error) => {
      setCurrentStage(-1); // Reset stages on error
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const saveCardsMutation = useMutation({
    mutationFn: async (updatedCards: PreviewCard[]) => {
      if (!preview) return;
      const res = await apiRequest("PUT", `/api/ice/preview/${preview.id}/cards`, { cards: updatedCards });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Cards saved", description: "Your changes have been saved." });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (!preview) throw new Error("No preview to save");
      const res = await apiRequest("POST", "/api/transformations/from-preview", { previewId: preview.id });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Experience saved!", description: "Your experience has been saved to your account." });
      navigate(`/admin/transformations/${data.jobId}`);
    },
    onError: (error: Error) => {
      if (error.message.includes("Authentication required")) {
        toast({ 
          title: "Sign in to save", 
          description: "Create a free account to save your experience and unlock premium features.",
        });
        // Include preview ID in return URL so user can resume after login
        const returnUrl = preview ? `/ice/preview/${preview.id}` : "/try";
        navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    },
  });

  const [isFileUploading, setIsFileUploading] = useState(false);
  
  const handleSubmit = async () => {
    if (inputType === "file") {
      if (!selectedFile) {
        toast({ title: "File required", description: "Please select a file to upload.", variant: "destructive" });
        return;
      }
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      try {
        setIsFileUploading(true);
        setCurrentStage(0); // Start the visual stages
        const res = await fetch("/api/ice/preview/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: "Upload failed" }));
          throw new Error(error.message || "Upload failed");
        }
        const data = await res.json();
        setCurrentStage(-1); // Reset stages
        setPreview(data);
        setCards(data.cards);
        navigate(`/ice/preview/${data.id}`);
        toast({ title: "Preview created!", description: "Your story cards are ready to edit." });
      } catch (error: any) {
        setCurrentStage(-1); // Reset stages on error
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      } finally {
        setIsFileUploading(false);
      }
      return;
    }
    
    const value = inputType === "url" ? urlValue.trim() : textValue.trim();
    if (!value) {
      toast({ title: "Input required", description: "Please enter a URL or paste your content.", variant: "destructive" });
      return;
    }
    createPreviewMutation.mutate({ type: inputType, value });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newCards = [...cards];
    const [removed] = newCards.splice(draggedIndex, 1);
    newCards.splice(index, 0, removed);
    newCards.forEach((card, i) => card.order = i);
    setCards(newCards);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    if (preview) {
      saveCardsMutation.mutate(cards);
    }
  };

  const handleCardEdit = (index: number, field: "title" | "content", value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleCardBlur = () => {
    if (preview) {
      saveCardsMutation.mutate(cards);
    }
  };

  if (loadingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex flex-col">
        <GlobalNav context="ice" showBreadcrumb breadcrumbLabel="ICE Maker" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading your preview...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex flex-col">
      <GlobalNav context="ice" showBreadcrumb breadcrumbLabel="ICE Maker" />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Try ICE Free</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Create Your Interactive Cinematic Experience
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Transform any content into an interactive story. Paste a URL or your script, and we'll generate story cards you can edit and reorder.
          </p>
        </div>

        {!preview ? (
          <Card className="bg-slate-900/80 border-slate-800">
            <CardContent className="p-6">
              <Tabs value={inputType} onValueChange={(v) => setInputType(v as "url" | "text" | "file")}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="url" className="flex items-center gap-2" data-testid="tab-url">
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">Website</span> URL
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-2" data-testid="tab-file">
                    <Upload className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2" data-testid="tab-text">
                    <FileText className="w-4 h-4" />
                    Paste
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url">
                  <div className="space-y-4">
                    <Input
                      placeholder="https://example.com/about"
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      className="bg-slate-800 border-slate-700"
                      data-testid="input-url"
                    />
                    <p className="text-sm text-slate-500">
                      Enter a website URL and we'll extract the key content to create your story.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="file">
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.pptx,.ppt,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        data-testid="input-file"
                      />
                      <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      {selectedFile ? (
                        <p className="text-white font-medium">{selectedFile.name}</p>
                      ) : (
                        <>
                          <p className="text-slate-300 mb-1">Click to upload a file</p>
                          <p className="text-sm text-slate-500">PDF, PowerPoint, Word, or Text files</p>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Upload a PDF, presentation, or document. We'll extract the content to create your story.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="text">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Paste your script, story outline, or any content here..."
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      rows={8}
                      className="bg-slate-800 border-slate-700"
                      data-testid="input-text"
                    />
                    <p className="text-sm text-slate-500">
                      Paste a script, article, or story outline. We'll break it into story cards.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {(createPreviewMutation.isPending || isFileUploading) && currentStage >= 0 ? (
                <div className="mt-6 space-y-4" data-testid="creation-stages">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">Creating Your Experience</h3>
                    <p className="text-sm text-slate-400">This usually takes 10-15 seconds</p>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {CREATION_STAGES.map((stage, index) => {
                        const status = index < currentStage ? "done" : index === currentStage ? "running" : "pending";
                        return (
                          <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              status === "done" ? "bg-green-500/10" :
                              status === "running" ? "bg-purple-500/20" : "bg-slate-800/50"
                            }`}
                            data-testid={`stage-${stage.id}`}
                          >
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                              status === "done" ? "bg-green-500" :
                              status === "running" ? "bg-purple-500" : "bg-slate-700"
                            }`}>
                              {status === "done" ? (
                                <Check className="w-4 h-4 text-white" />
                              ) : status === "running" ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <Circle className="w-3 h-3 text-slate-500" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              status === "done" ? "text-green-400" :
                              status === "running" ? "text-purple-300 font-medium" : "text-slate-500"
                            }`}>
                              {stage.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createPreviewMutation.isPending || isFileUploading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="button-create-preview"
                >
                  Create Preview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">{preview.title}</h2>
                  <VisibilityBadge visibility={((existingPreview as any)?.visibility as "private" | "unlisted" | "public") || "unlisted"} size="sm" />
                </div>
                <p className="text-sm text-slate-400">{cards.length} story cards</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  setCards([]);
                  setUrlValue("");
                  setTextValue("");
                }}
                data-testid="button-start-over"
              >
                Start Over
              </Button>
            </div>

            <div className="space-y-3">
              {cards.map((card, index) => (
                <Card
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-slate-900/80 border-slate-800 cursor-move transition-all ${
                    draggedIndex === index ? "opacity-50 scale-105" : ""
                  }`}
                  data-testid={`card-preview-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={card.title}
                          onChange={(e) => handleCardEdit(index, "title", e.target.value)}
                          onBlur={handleCardBlur}
                          className="bg-transparent border-transparent hover:border-slate-700 focus:border-purple-500 font-semibold text-white"
                          data-testid={`input-card-title-${index}`}
                        />
                        <Textarea
                          value={card.content}
                          onChange={(e) => handleCardEdit(index, "content", e.target.value)}
                          onBlur={handleCardBlur}
                          rows={2}
                          className="bg-transparent border-transparent hover:border-slate-700 focus:border-purple-500 text-slate-300 resize-none"
                          data-testid={`input-card-content-${index}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-900/50 border-slate-800 border-dashed">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Unlock Premium Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-800/50">
                    <Image className="w-6 h-6 text-purple-400 mb-2" />
                    <span className="text-sm text-slate-300">AI Images</span>
                    <Lock className="w-3 h-3 text-slate-500 mt-1" />
                  </div>
                  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-800/50">
                    <Play className="w-6 h-6 text-purple-400 mb-2" />
                    <span className="text-sm text-slate-300">Video</span>
                    <Lock className="w-3 h-3 text-slate-500 mt-1" />
                  </div>
                  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-800/50">
                    <Mic className="w-6 h-6 text-purple-400 mb-2" />
                    <span className="text-sm text-slate-300">Narration</span>
                    <Lock className="w-3 h-3 text-slate-500 mt-1" />
                  </div>
                  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-800/50">
                    <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
                    <span className="text-sm text-slate-300">Export</span>
                    <Lock className="w-3 h-3 text-slate-500 mt-1" />
                  </div>
                </div>

                {user ? (
                  <Button
                    onClick={() => promoteMutation.mutate()}
                    disabled={promoteMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    data-testid="button-save-experience"
                  >
                    {promoteMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Experience
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const returnUrl = preview ? `/ice/preview/${preview.id}` : "/try";
                      navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    data-testid="button-sign-in-to-save"
                  >
                    Sign In to Save & Unlock Features
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
