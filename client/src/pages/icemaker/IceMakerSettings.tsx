import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import IceMakerLayout from "@/components/IceMakerLayout";

const settingsSections = [
  {
    title: "Account",
    icon: User,
    items: [
      { label: "Display Name", value: "Your Name", type: "text" },
      { label: "Email Notifications", value: true, type: "toggle" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Project Updates", value: true, type: "toggle" },
      { label: "Weekly Digest", value: false, type: "toggle" },
    ],
  },
  {
    title: "Privacy",
    icon: Shield,
    items: [
      { label: "Public Profile", value: false, type: "toggle" },
      { label: "Analytics Tracking", value: true, type: "toggle" },
    ],
  },
];

export default function IceMakerSettings() {
  return (
    <IceMakerLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="text-settings-title">
            Settings
          </h1>
          <p className="text-white/60 text-sm">
            Manage your IceMaker preferences
          </p>
        </div>

        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
              data-testid={`section-${section.title.toLowerCase()}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-pink-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-white/70">{item.label}</span>
                    {item.type === "toggle" ? (
                      <Switch defaultChecked={item.value as boolean} data-testid={`toggle-${item.label.toLowerCase().replace(/\s+/g, '-')}`} />
                    ) : (
                      <span className="text-sm text-white/50">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button className="bg-pink-500 hover:bg-pink-600" data-testid="button-save-settings">
            Save Changes
          </Button>
        </div>
      </div>
    </IceMakerLayout>
  );
}
