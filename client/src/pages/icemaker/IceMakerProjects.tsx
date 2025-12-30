import { Link } from "wouter";
import { FolderOpen, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import IceMakerLayout from "@/components/IceMakerLayout";

export default function IceMakerProjects() {
  return (
    <IceMakerLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" data-testid="text-projects-title">
              My Projects
            </h1>
            <p className="text-white/60 text-sm">
              Manage your interactive experiences
            </p>
          </div>
          <Link href="/icemaker/create">
            <Button className="bg-pink-500 hover:bg-pink-600 gap-2" data-testid="button-new-project">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search projects..."
              className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/40"
              data-testid="input-search-projects"
            />
          </div>
          <Button variant="outline" className="border-white/10 text-white/60 gap-2" data-testid="button-filter">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2" data-testid="text-no-projects">
            No projects yet
          </h3>
          <p className="text-sm text-white/50 max-w-sm mb-6">
            Create your first interactive experience to get started
          </p>
          <Link href="/icemaker/create">
            <Button className="bg-pink-500 hover:bg-pink-600 gap-2" data-testid="button-create-first">
              <Plus className="w-4 h-4" />
              Create Your First Project
            </Button>
          </Link>
        </div>
      </div>
    </IceMakerLayout>
  );
}
