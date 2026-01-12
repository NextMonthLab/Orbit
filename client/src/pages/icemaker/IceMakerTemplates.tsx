import { Link } from "wouter";
import { Layout, ArrowRight, Film, GraduationCap, Building2, Sparkles } from "lucide-react";
import IceMakerLayout from "@/components/IceMakerLayout";

const templates = [
  {
    id: "brand-story",
    title: "Brand Story",
    description: "Tell your brand's story with cinematic visuals",
    icon: Building2,
    color: "from-blue-500/20 to-purple-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    id: "product-demo",
    title: "Product Demo",
    description: "Showcase your product with interactive walkthroughs",
    icon: Sparkles,
    color: "from-pink-500/20 to-purple-500/20",
    borderColor: "border-pink-500/30",
  },
  {
    id: "educational",
    title: "Educational Content",
    description: "Transform learning materials into engaging experiences",
    icon: GraduationCap,
    color: "from-green-500/20 to-blue-500/20",
    borderColor: "border-green-500/30",
  },
  {
    id: "film-treatment",
    title: "Film Treatment",
    description: "Bring scripts and treatments to life visually",
    icon: Film,
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
  },
];

export default function IceMakerTemplates() {
  return (
    <IceMakerLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="text-templates-title">
            Templates
          </h1>
          <p className="text-white/60 text-sm">
            Start from pre-built templates for common use cases
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Link key={template.id} href={`/icemaker/create?template=${template.id}`}>
              <div
                className={`group p-6 rounded-xl bg-gradient-to-br ${template.color} border ${template.borderColor} hover:border-white/30 transition-all cursor-pointer`}
                data-testid={`card-template-${template.id}`}
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <template.icon className="w-6 h-6 text-white/80" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{template.title}</h3>
                <p className="text-sm text-white/60 mb-4">{template.description}</p>
                <div className="flex items-center text-white/60 text-sm font-medium group-hover:gap-2 transition-all">
                  Use Template <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </IceMakerLayout>
  );
}
