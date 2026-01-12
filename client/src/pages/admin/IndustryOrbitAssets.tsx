import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Download, Upload, Loader2, CheckCircle, AlertCircle, 
  FileSpreadsheet, Image, RefreshCw
} from "lucide-react";
import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IndustryOrbit {
  id: number;
  slug: string;
  title: string;
}

interface ApprovalResult {
  success: boolean;
  updated: number;
  rejected: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export default function IndustryOrbitAssets() {
  const [selectedOrbit, setSelectedOrbit] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ApprovalResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: orbits, isLoading: orbitsLoading } = useQuery<IndustryOrbit[]>({
    queryKey: ["industry-orbits-list"],
    queryFn: async () => {
      const res = await fetch("/api/industry-orbits");
      if (!res.ok) throw new Error("Failed to fetch industry orbits");
      const data = await res.json();
      return data.orbits || [];
    },
  });

  const handleDownloadCsv = async () => {
    if (!selectedOrbit) {
      toast({ title: "Please select an orbit first", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`/api/industry-orbits/${selectedOrbit}/assets-review.csv`);
      if (!res.ok) throw new Error("Failed to download CSV");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedOrbit}-assets-review.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "CSV downloaded successfully" });
    } catch (error) {
      toast({ 
        title: "Download failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  const handleDownloadCpac = async () => {
    if (!selectedOrbit) {
      toast({ title: "Please select an orbit first", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`/api/industry-orbits/${selectedOrbit}/cpac`);
      if (!res.ok) throw new Error("Failed to download CPAC");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedOrbit}-cpac.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "CPAC JSON downloaded successfully" });
    } catch (error) {
      toast({ 
        title: "Download failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOrbit) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const content = await file.text();
      const isJson = file.name.endsWith('.json');
      
      const res = await fetch(`/api/industry-orbits/${selectedOrbit}/assets-approvals`, {
        method: 'POST',
        headers: {
          'Content-Type': isJson ? 'application/json' : 'text/csv',
        },
        body: content,
      });

      const result = await res.json();
      setUploadResult(result);

      if (result.success && result.updated > 0) {
        toast({ 
          title: "Assets updated successfully", 
          description: `Updated ${result.updated} assets` 
        });
      } else if (result.errors?.length > 0) {
        toast({ 
          title: "Upload completed with errors", 
          description: result.errors[0],
          variant: "destructive" 
        });
      } else if (result.updated === 0) {
        toast({ 
          title: "No assets updated", 
          description: "Make sure you have rows with Approved = YES" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Industry Orbit Assets</h1>
          <p className="text-gray-400">
            Manage images for Industry Orbit entities and products
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Image className="w-5 h-5" />
              Select Industry Orbit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedOrbit} onValueChange={setSelectedOrbit}>
              <SelectTrigger 
                className="w-full bg-gray-800 border-gray-700 text-white"
                data-testid="select-orbit"
              >
                <SelectValue placeholder="Choose an industry orbit..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {orbitsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : orbits?.length === 0 ? (
                  <SelectItem value="none" disabled>No industry orbits found</SelectItem>
                ) : (
                  orbits?.map((orbit) => (
                    <SelectItem 
                      key={orbit.slug} 
                      value={orbit.slug}
                      className="text-white"
                    >
                      {orbit.title || orbit.slug}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedOrbit && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Assets Review
                  </CardTitle>
                  <CardDescription>
                    Download CSV template to review and approve images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleDownloadCsv}
                    className="w-full"
                    data-testid="button-download-csv"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Download CSV Template
                  </Button>
                  <Button 
                    onClick={handleDownloadCpac}
                    variant="outline"
                    className="w-full"
                    data-testid="button-download-cpac"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Full CPAC JSON
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Approved Assets
                  </CardTitle>
                  <CardDescription>
                    Upload your reviewed CSV with approved images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload" className="text-gray-400 text-sm">
                        Select CSV or JSON file
                      </Label>
                      <Input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="mt-2 bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-white file:border-0"
                        data-testid="input-file-upload"
                      />
                    </div>
                    {uploading && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {uploadResult && (
              <Card className={`border ${uploadResult.success ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'}`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {uploadResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    Upload Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                      Updated: {uploadResult.updated}
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300">
                      Skipped: {uploadResult.skipped}
                    </Badge>
                    <Badge variant="secondary" className="bg-red-900/50 text-red-300">
                      Rejected: {uploadResult.rejected}
                    </Badge>
                  </div>
                  
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-red-400 font-medium mb-2">Errors:</h4>
                      <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                        {uploadResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {uploadResult.warnings.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-yellow-400 font-medium mb-2">Warnings:</h4>
                      <ul className="list-disc list-inside text-yellow-300 text-sm space-y-1">
                        {uploadResult.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-900 border-gray-800 mt-6">
              <CardHeader>
                <CardTitle className="text-white">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400 space-y-3">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Download the CSV template using the button above</li>
                  <li>Open in Google Sheets or Excel</li>
                  <li>For each row, add the image URL in the "Candidate Image URL" column</li>
                  <li>Set the "Source Type" (OFFICIAL_BRAND, PRESS_KIT, PRODUCT_PAGE, etc.)</li>
                  <li>Set "Approved" to YES for images you want to apply</li>
                  <li>Save as CSV and upload here</li>
                </ol>
                <p className="text-sm text-gray-500 mt-4">
                  Only rows with Approved = YES will be processed. Invalid URLs will be rejected.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
