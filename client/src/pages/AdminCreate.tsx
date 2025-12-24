import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Upload, Video, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { addMockCard, MOCK_CHARACTERS } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    dayIndex: 4,
    publishDate: new Date().toISOString().slice(0, 16),
    title: "",
    image: "",
    caption1: "",
    caption2: "",
    caption3: "",
    sceneText: "",
    status: "draft",
    selectedCharacters: [] as string[]
  });

  const handleCharacterToggle = (charId: string) => {
    setFormData(prev => ({
        ...prev,
        selectedCharacters: prev.selectedCharacters.includes(charId) 
            ? prev.selectedCharacters.filter(id => id !== charId)
            : [...prev.selectedCharacters, charId]
    }));
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.title) {
        toast({ title: "Error", description: "Title is required", variant: "destructive" });
        return;
    }

    const newCard = {
        id: `card_${Date.now()}`,
        dayIndex: Number(formData.dayIndex),
        title: formData.title,
        image: formData.image || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1080&h=1920&fit=crop", // Default placeholder
        captions: [formData.caption1, formData.caption2, formData.caption3].filter(Boolean),
        sceneText: formData.sceneText,
        recapText: `Day ${formData.dayIndex} - ${formData.title}`,
        publishDate: formData.publishDate + ":00Z",
    };

    addMockCard(newCard);
    
    toast({ title: "Success", description: "Card scheduled successfully." });
    setLocation("/catch-up");
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
        
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-display font-bold">Create New Card</h1>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline" onClick={handleSave}>Save Draft</Button>
                 <Button className="gap-2 bg-primary text-white hover:bg-primary/90" onClick={handleSave}>
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
                                    value={formData.dayIndex}
                                    onChange={(e) => setFormData({...formData, dayIndex: Number(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Publish Date</Label>
                                <Input 
                                    id="date" 
                                    type="datetime-local" 
                                    value={formData.publishDate}
                                    onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
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
                            />
                            <Input 
                                placeholder="Line 2" 
                                value={formData.caption2}
                                onChange={(e) => setFormData({...formData, caption2: e.target.value})}
                            />
                            <Input 
                                placeholder="Line 3" 
                                value={formData.caption3}
                                onChange={(e) => setFormData({...formData, caption3: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Scene Text (Story)</Label>
                            <Textarea 
                                placeholder="The actual story text..." 
                                className="h-32" 
                                value={formData.sceneText}
                                onChange={(e) => setFormData({...formData, sceneText: e.target.value})}
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
                        {MOCK_CHARACTERS.map(char => (
                            <div key={char.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleCharacterToggle(char.id)}>
                                <Checkbox 
                                    id={char.id} 
                                    checked={formData.selectedCharacters.includes(char.id)}
                                    onCheckedChange={() => handleCharacterToggle(char.id)}
                                />
                                <Label htmlFor={char.id} className="flex-1 cursor-pointer font-medium">
                                    {char.name} <span className="text-muted-foreground font-normal text-xs ml-2">({char.role})</span>
                                </Label>
                            </div>
                        ))}
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
                                    <span className="text-xs uppercase font-bold">Paste Image URL</span>
                                </>
                            )}
                            <Input 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                type="text"
                                placeholder="Paste Image URL here temporarily"
                                onChange={(e) => {
                                    const val = prompt("Paste an image URL (Unsplash, etc):");
                                    if(val) setFormData({...formData, image: val});
                                }}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Visual Effect</Label>
                            <Select defaultValue="ken-burns">
                                <SelectTrigger>
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
