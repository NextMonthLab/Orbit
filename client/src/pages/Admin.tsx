import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BarChart3, Calendar, Plus, Users, Video, Upload, ChevronDown, PenSquare, Loader2, Eye, Wand2, ImageIcon, CheckCircle, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedUniverseId, setSelectedUniverseId] = useState<number | null>(null);
  const [showNewUniverseDialog, setShowNewUniverseDialog] = useState(false);
  const [newUniverseName, setNewUniverseName] = useState("");
  const [newUniverseDescription, setNewUniverseDescription] = useState("");
  const [previewCard, setPreviewCard] = useState<any>(null);
  const [generatingCardId, setGeneratingCardId] = useState<number | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showDeleteUniverseDialog, setShowDeleteUniverseDialog] = useState(false);

  const { data: universes, isLoading: universesLoading } = useQuery({
    queryKey: ["universes"],
    queryFn: () => api.getUniverses(),
  });

  const selectedUniverse = universes?.find(u => u.id === selectedUniverseId) || universes?.[0];

  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ["cards", selectedUniverse?.id],
    queryFn: () => api.getCards(selectedUniverse!.id),
    enabled: !!selectedUniverse,
  });

  const createUniverseMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      api.createUniverse(data),
    onSuccess: (newUniverse) => {
      queryClient.invalidateQueries({ queryKey: ["universes"] });
      setSelectedUniverseId(newUniverse.id);
      setShowNewUniverseDialog(false);
      setNewUniverseName("");
      setNewUniverseDescription("");
      toast({
        title: "Universe created",
        description: `"${newUniverse.name}" is now ready for cards!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create universe",
        variant: "destructive",
      });
    },
  });

  const deleteAllCardsMutation = useMutation({
    mutationFn: (universeId: number) => api.deleteAllCards(universeId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards", selectedUniverse?.id] });
      setShowDeleteAllDialog(false);
      toast({
        title: "Cards deleted",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete cards",
        variant: "destructive",
      });
    },
  });

  const deleteUniverseMutation = useMutation({
    mutationFn: (universeId: number) => api.deleteUniverse(universeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universes"] });
      setSelectedUniverseId(null);
      setShowDeleteUniverseDialog(false);
      toast({
        title: "Universe deleted",
        description: "The universe and all its content have been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete universe",
        variant: "destructive",
      });
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: (cardId: number) => api.generateCardImage(cardId),
    onMutate: (cardId) => {
      setGeneratingCardId(cardId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["cards", selectedUniverse?.id] });
      setGeneratingCardId(null);
      toast({
        title: "Image Generated",
        description: `Image created for "${result.cardTitle}"`,
      });
    },
    onError: (error: any, cardId) => {
      setGeneratingCardId(null);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    },
  });

  const handleCreateUniverse = () => {
    if (!newUniverseName.trim()) {
      toast({
        title: "Error",
        description: "Universe name is required",
        variant: "destructive",
      });
      return;
    }
    createUniverseMutation.mutate({
      name: newUniverseName,
      description: newUniverseDescription,
    });
  };

  const isEngineGenerated = selectedUniverse?.visualMode === 'engine_generated';

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <h2 className="text-2xl font-display font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (universesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
        
        {/* Header Section - Mobile Optimized */}
        <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Showrunner Dashboard</h1>
            
            {/* Universe Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="justify-between w-full sm:w-auto min-w-[200px]" data-testid="button-universe-dropdown">
                            <span className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs uppercase">Universe:</span>
                                <span className="font-semibold truncate max-w-[150px]">{selectedUniverse?.name || "Select..."}</span>
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[280px]">
                        <DropdownMenuLabel>Select Universe</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {universes?.map(u => (
                          <DropdownMenuItem 
                            key={u.id}
                            className={`cursor-pointer ${u.id === selectedUniverse?.id ? 'font-bold bg-accent/50' : ''}`}
                            onClick={() => setSelectedUniverseId(u.id)}
                            data-testid={`menu-universe-${u.id}`}
                          >
                            {u.name}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => setShowNewUniverseDialog(true)}
                          data-testid="menu-create-universe"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Universe...
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className="hidden sm:inline text-muted-foreground/50">•</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Season 1</span>
            </div>

            {/* Action Buttons - Mobile Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <Link href="/admin/create" className="contents">
                    <Button className="gap-2 h-12 sm:h-10" variant="outline" data-testid="button-create-card" disabled={!selectedUniverse}>
                        <Plus className="w-4 h-4" /> 
                        <span className="hidden sm:inline">Create Card</span>
                        <span className="sm:hidden">Card</span>
                    </Button>
                </Link>
                <Link href="/admin/import" className="contents">
                    <Button className="gap-2 h-12 sm:h-10 bg-white text-black hover:bg-white/90" data-testid="button-import" disabled={!selectedUniverse}>
                        <Upload className="w-4 h-4" /> 
                        <span className="hidden sm:inline">Import Pack</span>
                        <span className="sm:hidden">Import</span>
                    </Button>
                </Link>
            </div>

            {/* Danger Zone - Collapsible on Mobile */}
            {selectedUniverse && (
              <div className="border border-destructive/30 rounded-lg p-3 bg-destructive/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm">
                    <span className="font-medium text-destructive">Danger Zone</span>
                    <p className="text-muted-foreground text-xs mt-0.5">Destructive actions for "{selectedUniverse.name}"</p>
                  </div>
                  <div className="flex gap-2">
                    <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground flex-1 sm:flex-initial"
                          data-testid="button-delete-all-cards" 
                          disabled={!cards?.length}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Cards
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete All Cards?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all {cards?.length || 0} cards from "{selectedUniverse?.name}". 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => selectedUniverse && deleteAllCardsMutation.mutate(selectedUniverse.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteAllCardsMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Delete All Cards
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog open={showDeleteUniverseDialog} onOpenChange={setShowDeleteUniverseDialog}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm"
                          variant="destructive" 
                          className="gap-1.5 flex-1 sm:flex-initial"
                          data-testid="button-delete-universe"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Universe
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Universe?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{selectedUniverse?.name}" and all its content including cards, characters, and locations. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => selectedUniverse && deleteUniverseMutation.mutate(selectedUniverse.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteUniverseMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Delete Universe
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}
        </div>
        
        {!selectedUniverse ? (
          <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="w-12 h-12 text-primary/50 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Universe Selected</h3>
              <p className="text-muted-foreground mb-6">Create your first universe to start adding story cards.</p>
              <Button onClick={() => setShowNewUniverseDialog(true)} data-testid="button-create-first-universe">
                <Plus className="w-4 h-4 mr-2" /> Create Universe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-center justify-between text-sm text-primary/80">
                <p>💡 <strong>Tip:</strong> Manual is best for editing one card. Import is best for uploading an entire season.</p>
                 <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 hover:text-primary hover:bg-primary/10">
                    <PenSquare className="w-3 h-3" /> Edit Universe Details
                 </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" data-testid="text-card-count">{cards?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">in this universe</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" data-testid="text-published-count">
                          {cards?.filter(c => c.status === 'published').length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Calendar */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Scheduled Drops
                    </h3>
                </div>
                <div className="divide-y divide-border">
                    {cardsLoading ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : cards?.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No cards yet. Create your first card to get started!
                      </div>
                    ) : (
                      cards?.map((card) => {
                        const hasPrompt = !!(card.sceneDescription || card.imageGeneration?.prompt);
                        const displayImage = card.generatedImageUrl || card.imagePath;
                        const needsGeneration = isEngineGenerated && hasPrompt && !card.imageGenerated;
                        const isGenerating = generatingCardId === card.id;
                        
                        return (
                        <div key={card.id} className="p-4 flex items-center justify-between hover:bg-muted/10" data-testid={`card-row-${card.id}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-muted rounded overflow-hidden relative">
                                    {displayImage ? (
                                      <img src={displayImage} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                      </div>
                                    )}
                                    {card.imageGenerated && (
                                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold">Day {card.dayIndex}: {card.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {card.publishAt ? `Scheduled: ${new Date(card.publishAt).toLocaleDateString()}` : 'Not scheduled'}
                                      {isEngineGenerated && (
                                        <span className="ml-2">
                                          {card.imageGenerated ? (
                                            <span className="text-green-500">• Image ready</span>
                                          ) : hasPrompt ? (
                                            <span className="text-yellow-500">• Needs image</span>
                                          ) : (
                                            <span className="text-muted-foreground/50">• No prompt</span>
                                          )}
                                        </span>
                                      )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                 {needsGeneration && (
                                   <Button 
                                     variant="outline" 
                                     size="sm" 
                                     className="h-8 gap-1 border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
                                     onClick={() => generateImageMutation.mutate(card.id)}
                                     disabled={isGenerating}
                                     data-testid={`button-generate-${card.id}`}
                                   >
                                     {isGenerating ? (
                                       <Loader2 className="w-3 h-3 animate-spin" />
                                     ) : (
                                       <Wand2 className="w-3 h-3" />
                                     )}
                                     {isGenerating ? 'Generating...' : 'Generate'}
                                   </Button>
                                 )}
                                 <span className={`px-2 py-1 text-xs rounded border ${
                                   card.status === 'published' 
                                     ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                     : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                 }`}>
                                   {card.status === 'published' ? 'Published' : 'Draft'}
                                 </span>
                                 <Link href={`/card/${card.id}`}>
                                   <Button 
                                     variant="outline" 
                                     size="sm" 
                                     className="h-8 gap-1"
                                     data-testid={`button-view-${card.id}`}
                                   >
                                     <Eye className="w-3 h-3" /> View
                                   </Button>
                                 </Link>
                                 <Button variant="outline" size="sm" className="h-8">Edit</Button>
                            </div>
                        </div>
                      );})
                    )}
                </div>
            </div>
          </>
        )}

        {/* Create Universe Dialog */}
        <Dialog open={showNewUniverseDialog} onOpenChange={setShowNewUniverseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Universe</DialogTitle>
              <DialogDescription>
                A universe is a story world that contains characters and cards.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="universe-name">Universe Name</Label>
                <Input
                  id="universe-name"
                  placeholder="e.g., Neon Rain"
                  value={newUniverseName}
                  onChange={(e) => setNewUniverseName(e.target.value)}
                  data-testid="input-universe-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="universe-description">Description</Label>
                <Textarea
                  id="universe-description"
                  placeholder="A brief description of your story world..."
                  value={newUniverseDescription}
                  onChange={(e) => setNewUniverseDescription(e.target.value)}
                  data-testid="input-universe-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewUniverseDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUniverse}
                disabled={createUniverseMutation.isPending}
                data-testid="button-submit-universe"
              >
                {createUniverseMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Universe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Card Preview Dialog */}
        <Dialog open={!!previewCard} onOpenChange={(open) => !open && setPreviewCard(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-primary">Day {previewCard?.dayIndex}:</span> {previewCard?.title}
              </DialogTitle>
              <DialogDescription>
                {previewCard?.status === 'published' ? 'Published' : 'Draft'} 
                {previewCard?.publishAt && ` • Scheduled: ${new Date(previewCard.publishAt).toLocaleDateString()}`}
              </DialogDescription>
            </DialogHeader>
            
            {previewCard && (
              <div className="space-y-6 py-4">
                {/* Card Image Preview */}
                {previewCard.imagePath && (
                  <div className="aspect-[9/16] max-h-[300px] w-auto mx-auto bg-muted rounded-lg overflow-hidden border">
                    <img 
                      src={previewCard.imagePath} 
                      alt={previewCard.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Captions */}
                {previewCard.captionsJson && previewCard.captionsJson.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Captions</h4>
                    <div className="bg-black/50 p-4 rounded-lg space-y-2">
                      {previewCard.captionsJson.map((caption: string, i: number) => (
                        <p key={i} className="text-white/90 italic text-center">"{caption}"</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Scene Text */}
                {previewCard.sceneText && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Scene Text</h4>
                    <p className="text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-lg">
                      {previewCard.sceneText}
                    </p>
                  </div>
                )}
                
                {/* Recap */}
                {previewCard.recapText && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Journal Recap</h4>
                    <p className="text-muted-foreground text-sm">{previewCard.recapText}</p>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                  <div>
                    <span className="text-muted-foreground">Effect:</span>{' '}
                    <span className="font-medium">{previewCard.effectTemplate || 'ken-burns'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Season:</span>{' '}
                    <span className="font-medium">{previewCard.season || 1}</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewCard(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
