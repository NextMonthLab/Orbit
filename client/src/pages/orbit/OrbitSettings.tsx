import { Settings, Building2, Globe, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import OrbitLayout from "@/components/OrbitLayout";

export default function OrbitSettings() {
  return (
    <OrbitLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="text-settings-title">
            Settings
          </h1>
          <p className="text-white/60 text-sm">
            Manage your Orbit preferences and business information
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="section-business">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Business Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 block mb-1">Business Name</label>
                <Input
                  placeholder="Your Business Name"
                  className="bg-white/5 border-white/10 text-white"
                  data-testid="input-business-name"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-1">Website</label>
                <Input
                  placeholder="https://example.com"
                  className="bg-white/5 border-white/10 text-white"
                  data-testid="input-website"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="section-ai">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">AI Discovery Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Allow AI Indexing</p>
                  <p className="text-xs text-white/50">Let AI systems discover your business</p>
                </div>
                <Switch defaultChecked data-testid="toggle-ai-indexing" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Auto-Update Knowledge</p>
                  <p className="text-xs text-white/50">Automatically sync changes to AI systems</p>
                </div>
                <Switch defaultChecked data-testid="toggle-auto-update" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="section-notifications">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">AI Accuracy Alerts</span>
                <Switch defaultChecked data-testid="toggle-accuracy-alerts" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Weekly Reports</span>
                <Switch data-testid="toggle-weekly-reports" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button className="bg-blue-500 hover:bg-blue-600" data-testid="button-save-settings">
            Save Changes
          </Button>
        </div>
      </div>
    </OrbitLayout>
  );
}
