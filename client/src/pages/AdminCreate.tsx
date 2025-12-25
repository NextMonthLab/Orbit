import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Upload, Video, Users, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminCreate() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    dayIndex: 1,
    publishDate: new Date().toISOString().slice(0, 16),
    title: "",
    image: "",
    caption1: "",
    caption2: "",
    caption3: "",
    sceneText: "",
    recapText: "",
    status: "draft",
    effectTemplate: "ken-burns",
    selectedCharacters: [] as number[]
  });

  const { data: universes } = useQuery({
    queryKey: ["universes"],
    queryFn: () => api.getUniverses(),
  });

  const [selectedUniverseId, setSelectedUniverseId] = useState<number | null>(null);
  const universe = universes?.find(u => u.id === selectedUniverseId) || universes?.[0];

  const { data: characters } = useQuery({
    queryKey: ["characters", universe?.id],
    queryFn: () => api.getCharacters(universe!.id),
    enabled: !!universe,
  });

  const { data: existingCards } = useQuery({
    queryKey: ["cards", universe?.id],
    queryFn: () => api.getCards(universe!.id),
    enabled: !!universe,
  });

  const createCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      const card = await api.createCard(cardData);
      for (const charId of formData.selectedCharacters) {
        await api.linkCardCharacter(card.id, charId);
      }
      return card;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast({ title: "Success", description: "Card created successfully." });
      setLocation("/admin");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create card", 
        variant: "destructive" 
      });
    },
  });

  const handleCharacterToggle = (charId: number) => {
    setFormData(prev => ({
        ...prev,
        selectedCharacters: prev.selectedCharacters.includes(charId) 
            ? prev.selectedCharacters.filter(id => id !== charId)
            : [...prev.selectedCharacters, charId]
    }));
  };

  const handleSave = (status: string) => {
    if (!formData.title) {
        toast({ title: "Error", description: "Title is required", variant: "destructive" });
        return;
    }

    if (!universe) {
        toast({ title: "Error", description: "No universe selected", variant: "destructive" });
        return;
    }

    const cardData = {
        universeId: universe.id,
        season: 1,
        dayIndex: Number(formData.dayIndex),
        title: formData.title,
        imagePath: formData.image || null,
        captionsJson: [formData.caption1, formData.caption2, formData.caption3].filter(Boolean),
        sceneText: formData.sceneText,
        recapText: formData.recapText || `Day ${formData.dayIndex} - ${formData.title}`,
        effectTemplate: formData.effectTemplate,
        status: status,
        publishAt: status === 'published' ? new Date(formData.publishDate) : null,
    };

    createCardMutation.mutate(cardData);
  };

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

  const nextDayIndex = existingCards ? Math.max(...existingCards.map(c => c.dayIndex), 0) + 1 : 1;

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
        
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" data-testid="button-back">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-display font-bold">Create New Card</h1>
                  <p className="text-sm text-muted-foreground">
                    Universe: {universe?.name || "None selected"}
                  </p>
                </div>
            </div>
            <div className="flex gap-2">
                 <Button 
                   variant="outline" 
                   onClick={() => handleSave("draft")}
                   disabled={createCardMutation.isPending}
                   data-testid="button-save-draft"
                 >
                   {createCardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                   Save Draft
                 </Button>
                 <Button 
                   className="gap-2 bg-primary text-white hover:bg-primary/90" 
                   onClick={() => handleSave("published")}
                   disabled={createCardMutation.isPending}
                   data-testid="button-publish"
                 >
                   {createCardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                   Schedule Publish
                 </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Core Details</CardTitle>
                        <CardDescription>The fundamental metadata for this story drop.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="day">Day Index</Label>
                                <Input 
                                    id="day" 
                                    type="number" 
                                    value={formData.dayIndex || nextDayIndex}
                                    onChange={(e) => setFormData({...formData, dayIndex: Number(e.target.value)})}
                                    data-testid="input-day-index"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Publish Date</Label>
                                <Input 
                                    id="date" 
                                    type="datetime-local" 
                                    value={formData.publishDate}
                                    onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                                    data-testid="input-publish-date"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Card Title</Label>
                            <Input 
                                id="title" 
                                placeholder="e.g. The Betrayal" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                data-testid="input-title"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Narrative Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Overlay Captions (3 lines)</Label>
                            <Input 
                                placeholder="Line 1" 
                                value={formData.caption1}
                                onChange={(e) => setFormData({...formData, caption1: e.target.value})}
                                data-testid="input-caption-1"
                            />
                            <Input 
                                placeholder="Line 2" 
                                value={formData.caption2}
                                onChange={(e) => setFormData({...formData, caption2: e.target.value})}
                                data-testid="input-caption-2"
                            />
                            <Input 
                                placeholder="Line 3" 
                                value={formData.caption3}
                                onChange={(e) => setFormData({...formData, caption3: e.target.value})}
                                data-testid="input-caption-3"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Scene Text (Story)</Label>
                            <Textarea 
                                placeholder="The actual story text..." 
                                className="h-32" 
                                value={formData.sceneText}
                                onChange={(e) => setFormData({...formData, sceneText: e.target.value})}
                                data-testid="input-scene-text"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Recap Text</Label>
                            <Input 
                                placeholder="Brief summary for the journal" 
                                value={formData.recapText}
                                onChange={(e) => setFormData({...formData, recapText: e.target.value})}
                                data-testid="input-recap-text"
                            />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" /> Available Characters
                        </CardTitle>
                        <CardDescription>Who can the user chat with after viewing this card?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!characters || characters.length === 0 ? (
                          <p className="text-muted-foreground text-sm">No characters available for this universe yet.</p>
                        ) : (
                          characters.map(char => (
                            <div 
                              key={char.id} 
                              className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer" 
                              onClick={() => handleCharacterToggle(char.id)}
                              data-testid={`checkbox-character-${char.id}`}
                            >
                                <Checkbox 
                                    id={`char-${char.id}`} 
                                    checked={formData.selectedCharacters.includes(char.id)}
                                    onCheckedChange={() => handleCharacterToggle(char.id)}
                                />
                                <Label htmlFor={`char-${char.id}`} className="flex-1 cursor-pointer font-medium">
                                    {char.name} <span className="text-muted-foreground font-normal text-xs ml-2">({char.role})</span>
                                </Label>
                            </div>
                          ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Visual Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-[9/16] bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden group">
                            {formData.image ? (
                                <img src={formData.image} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-xs uppercase font-bold">Click to add image</span>
                                </>
                            )}
                        </div>
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <Input 
                            placeholder="https://images.unsplash.com/..."
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            data-testid="input-image-url"
                          />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Visual Effect</Label>
                            <Select 
                              value={formData.effectTemplate}
                              onValueChange={(val) => setFormData({...formData, effectTemplate: val})}
                            >
                                <SelectTrigger data-testid="select-effect">
                                    <SelectValue placeholder="Select effect" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ken-burns">Slow Zoom (Ken Burns)</SelectItem>
                                    <SelectItem value="smoke">Noir Smoke Overlay</SelectItem>
                                    <SelectItem value="glitch">Cyber Glitch</SelectItem>
                                    <SelectItem value="none">Static</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                         <Button variant="secondary" className="w-full gap-2" disabled>
                             <Video className="w-4 h-4" /> Regenerate Video
                         </Button>
                    </CardContent>
                </Card>
            </div>

        </div>

      </div>
    </Layout>
  );
}
