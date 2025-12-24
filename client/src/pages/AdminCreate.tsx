import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminCreate() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
        
        <div className="flex items-center gap-4">
            <Link href="/admin">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
            </Link>
            <h1 className="text-3xl font-display font-bold">Create New Card</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Core Details</CardTitle>
                    <CardDescription>The fundamental metadata for this story drop.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="day">Day Index</Label>
                            <Input id="day" type="number" placeholder="4" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Publish Date</Label>
                            <Input id="date" type="datetime-local" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Card Title</Label>
                        <Input id="title" placeholder="e.g. The Betrayal" />
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Visual Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-[9/16] bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-xs uppercase font-bold">Upload Vertical Image</span>
                        <span className="text-[10px] opacity-50">1080x1920 (9:16)</span>
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
                </CardContent>
            </Card>

            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Narrative Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Overlay Captions (3 lines)</Label>
                        <Input placeholder="Line 1" />
                        <Input placeholder="Line 2" />
                        <Input placeholder="Line 3" />
                    </div>
                    <div className="space-y-2">
                        <Label>Scene Text (Story)</Label>
                        <Textarea placeholder="The actual story text that appears below the card..." className="h-32" />
                    </div>
                </CardContent>
            </Card>

        </div>

        <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setLocation("/admin")}>Cancel</Button>
            <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
                <Save className="w-4 h-4" /> Save & Schedule
            </Button>
        </div>

      </div>
    </Layout>
  );
}
