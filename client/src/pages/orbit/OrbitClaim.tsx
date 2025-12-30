import { Building2, ArrowRight, Globe, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OrbitLayout from "@/components/OrbitLayout";
import { Link } from "wouter";

export default function OrbitClaim() {
  return (
    <OrbitLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white" data-testid="text-claim-title">
            Claim Your Orbit
          </h1>
          <p className="text-white/60">
            Set up your business presence for AI-powered discovery
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <h2 className="text-lg font-semibold text-white">Step 1: Enter Your Website</h2>
            <p className="text-sm text-white/60">
              We'll analyze your website to understand your business and create your Orbit profile.
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="https://yourbusiness.com"
                  className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/40"
                  data-testid="input-website-url"
                />
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600" data-testid="button-analyze">
                Analyze
              </Button>
            </div>
          </div>

          <div className="text-center text-white/40 text-sm">or</div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 border-dashed space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-white/60" />
            </div>
            <h2 className="text-lg font-semibold text-white">Upload Business Documents</h2>
            <p className="text-sm text-white/60">
              Upload PDFs, presentations, or other documents about your business
            </p>
            <Button variant="outline" className="border-white/20 text-white/60" data-testid="button-upload">
              Choose Files
            </Button>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-white/40">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </OrbitLayout>
  );
}
