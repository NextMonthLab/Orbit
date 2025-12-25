import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, FileArchive, CheckCircle2, AlertTriangle, Loader2, Construction } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";

export default function AdminImport() {
  const { user } = useAuth();
  const [isDryRun, setIsDryRun] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
      toast({ 
        title: "File Selected", 
        description: e.target.files[0].name 
      });
    }
  };

  const handleImport = () => {
    toast({ 
      title: "Coming Soon", 
      description: "ZIP import functionality is under development. Use 'Create Card' to add content manually for now.",
      variant: "default"
    });
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

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
        
        <div className="flex items-center gap-4">
            <Link href="/admin">
                <Button variant="ghost" size="icon" data-testid="button-back">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-display font-bold">Import Season Pack</h1>
                <p className="text-muted-foreground">Bulk upload content via ZIP archive</p>
            </div>
        </div>

        {/* Coming Soon Notice */}
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="flex items-center gap-4 p-6">
            <Construction className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-yellow-500">Feature Under Development</h3>
              <p className="text-sm text-muted-foreground">
                ZIP import is coming soon. For now, please use the{" "}
                <Link href="/admin/create" className="text-primary underline">Create Card</Link>
                {" "}page to add content manually.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 pointer-events-none">
            
            {/* Left Column: Input */}
            <Card className="md:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Source File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center text-center hover:bg-muted/50 transition-colors cursor-pointer group relative">
                        <Input 
                            type="file" 
                            accept=".zip" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            onChange={handleFileSelect}
                            disabled
                            data-testid="input-zip-file"
                        />
                        <FileArchive className="w-10 h-10 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                        <span className="font-bold text-sm">Drop ZIP file here</span>
                        <span className="text-xs text-muted-foreground mt-1">manifest.json + assets</span>
                    </div>

                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-muted/20">
                        <Label htmlFor="dry-run" className="flex flex-col gap-1 cursor-pointer">
                            <span>Dry Run Mode</span>
                            <span className="font-normal text-xs text-muted-foreground">Validate only, no DB writes</span>
                        </Label>
                        <Switch id="dry-run" checked={isDryRun} onCheckedChange={setIsDryRun} disabled />
                    </div>

                    <Button className="w-full gap-2" onClick={handleImport} disabled>
                        <Upload className="w-4 h-4" />
                        {isDryRun ? "Run Validation" : "Import Pack"}
                    </Button>
                </CardContent>
            </Card>

            {/* Right Column: Report */}
            <Card className="md:col-span-2 min-h-[400px]">
                <CardHeader>
                    <CardTitle>Import Report</CardTitle>
                    <CardDescription>Status and validation output</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
                        <FileArchive className="w-12 h-12 mb-4" />
                        <p>Upload a file to see validation results</p>
                    </div>
                </CardContent>
            </Card>

        </div>
      </div>
    </Layout>
  );
}
