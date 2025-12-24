import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, FileArchive, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminImport() {
  const { toast } = useToast();
  const [isDryRun, setIsDryRun] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<null | {
    createdCards: number;
    createdCharacters: number;
    warnings: string[];
    errors: string[];
    schedule: { day: number; title: string; date: string }[];
  }>(null);

  const handleImport = () => {
    setIsProcessing(true);
    setReport(null);

    // Mock processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setReport({
        createdCards: 12,
        createdCharacters: 3,
        warnings: ["Asset missing: 'smoke_overlay_v2.mp4' - falling back to default"],
        errors: [],
        schedule: [
          { day: 1, title: "The Beginning", date: "2023-11-01" },
          { day: 2, title: "First Contact", date: "2023-11-02" },
          { day: 3, title: "The Signal", date: "2023-11-03" },
          { day: 4, title: "Interference", date: "2023-11-04" },
        ]
      });
      toast({ 
        title: isDryRun ? "Dry Run Complete" : "Import Successful", 
        description: isDryRun ? "No changes were made to the database." : "Season pack has been imported." 
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
        
        <div className="flex items-center gap-4">
            <Link href="/admin">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-display font-bold">Import Season Pack</h1>
                <p className="text-muted-foreground">Bulk upload content via ZIP archive</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
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
                            onChange={(e) => {
                                if (e.target.files?.length) {
                                    toast({ title: "File Selected", description: e.target.files[0].name });
                                }
                            }}
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
                        <Switch id="dry-run" checked={isDryRun} onCheckedChange={setIsDryRun} />
                    </div>

                    <Button className="w-full gap-2" onClick={handleImport} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isProcessing ? "Processing..." : isDryRun ? "Run Validation" : "Import Pack"}
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
                    {!report && !isProcessing && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
                            <FileArchive className="w-12 h-12 mb-4" />
                            <p>Upload a file to see validation results</p>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <div className="text-sm text-muted-foreground text-center">
                                <p>Unpacking archive...</p>
                                <p className="opacity-50">Validating assets...</p>
                            </div>
                        </div>
                    )}

                    {report && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="text-2xl font-bold">{report.createdCards}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Cards Found</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-2xl font-bold">{report.createdCharacters}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Characters Found</p>
                                    </div>
                                </div>
                            </div>

                            {report.warnings.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-bold text-sm flex items-center gap-2 text-yellow-500">
                                        <AlertTriangle className="w-4 h-4" /> Warnings
                                    </h4>
                                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-md p-3 text-sm font-mono text-yellow-200/80">
                                        {report.warnings.map((w, i) => (
                                            <p key={i}>[WARN] {w}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h4 className="font-bold text-sm">Schedule Preview</h4>
                                <ScrollArea className="h-48 border rounded-md">
                                    <div className="p-4 space-y-2">
                                        {report.schedule.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                                                <div className="flex gap-4">
                                                    <span className="font-mono text-muted-foreground w-8">D{item.day}</span>
                                                    <span>{item.title}</span>
                                                </div>
                                                <span className="text-muted-foreground font-mono text-xs">{item.date}</span>
                                            </div>
                                        ))}
                                        <div className="text-center text-xs text-muted-foreground pt-2">
                                            + 8 more entries...
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
      </div>
    </Layout>
  );
}
