import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  User, 
  Upload, 
  Globe, 
  FileText, 
  Loader2,
  ArrowLeft,
  Sparkles,
  Shield,
  MessageSquare,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

interface Universe {
  id: number;
  name: string;
}

function TrainingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    processing: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    ready: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };
  
  const icons: Record<string, React.ReactNode> = {
    pending: <Loader2 className="w-3 h-3" />,
    processing: <Loader2 className="w-3 h-3 animate-spin" />,
    ready: <Check className="w-3 h-3" />,
    failed: <AlertCircle className="w-3 h-3" />,
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function CharacterCreatorPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [guardrails, setGuardrails] = useState("");
  const [universeId, setUniverseId] = useState<string>("");
  const [knowledgeTab, setKnowledgeTab] = useState("url");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const { data: universes } = useQuery<Universe[]>({
    queryKey: ["universes"],
    queryFn: async () => {
      const res = await fetch("/api/universes", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch universes");
      return res.json();
    },
  });
  
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/characters/custom", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create character");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Character created", description: `${name} is now ready to chat.` });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      navigate(`/admin`);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !role.trim() || !universeId) {
      toast({ title: "Error", description: "Please fill in name, role, and select a universe", variant: "destructive" });
      return;
    }
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("description", description);
    formData.append("systemPrompt", systemPrompt);
    formData.append("guardrails", guardrails);
    formData.append("universeId", universeId);
    
    if (knowledgeTab === "url" && sourceUrl.trim()) {
      formData.append("knowledgeSourceUrl", sourceUrl);
    } else if (knowledgeTab === "upload" && file) {
      formData.append("knowledgeFile", file);
    }
    
    createMutation.mutate(formData);
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-3xl">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold" data-testid="page-title">Create AI Character</h1>
          <p className="text-muted-foreground">
            Build a custom interactive character for your audience
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Character Identity
              </CardTitle>
              <CardDescription>
                Define who your character is and how they should behave
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Character Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Professor Chen, Coach Max"
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., AI Tutor, Business Advisor"
                    data-testid="input-role"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="universe">Universe *</Label>
                <Select value={universeId} onValueChange={setUniverseId}>
                  <SelectTrigger data-testid="select-universe">
                    <SelectValue placeholder="Select a universe for this character" />
                  </SelectTrigger>
                  <SelectContent>
                    {universes?.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of who this character is..."
                  rows={2}
                  data-testid="input-description"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5" />
                Personality & Behavior
              </CardTitle>
              <CardDescription>
                Define how your character communicates and what they know
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a friendly and knowledgeable tutor who helps students understand complex topics. You explain things simply and encourage questions..."
                  rows={4}
                  data-testid="input-system-prompt"
                />
                <p className="text-xs text-muted-foreground">
                  Instructions that define how the character speaks, thinks, and responds
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" />
                Guardrails
              </CardTitle>
              <CardDescription>
                Set boundaries for what the character can and cannot discuss
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="guardrails">Safety Rules & Limits</Label>
                <Textarea
                  id="guardrails"
                  value={guardrails}
                  onChange={(e) => setGuardrails(e.target.value)}
                  placeholder="- Do not provide medical, legal, or financial advice
- Always recommend consulting a professional for serious matters
- Stay focused on educational topics only
- Do not share personal opinions on politics or religion"
                  rows={4}
                  data-testid="input-guardrails"
                />
                <p className="text-xs text-muted-foreground">
                  Rules the character must follow to keep conversations safe and appropriate
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5" />
                Knowledge Source
              </CardTitle>
              <CardDescription>
                Train your character with custom knowledge from a website or document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={knowledgeTab} onValueChange={setKnowledgeTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="url" className="gap-2">
                    <Globe className="w-4 h-4" />
                    Website URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Upload Document
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-2">
                  <Label htmlFor="sourceUrl">Website URL</Label>
                  <Input
                    id="sourceUrl"
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com/about"
                    data-testid="input-source-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    The character will learn from the content on this page
                  </p>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-2">
                  <Label htmlFor="file">Upload Document</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    data-testid="input-file"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, TXT, Markdown
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Button
            type="submit"
            disabled={createMutation.isPending || !name.trim() || !role.trim() || !universeId}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            data-testid="button-create-character"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Character...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Character
              </>
            )}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
