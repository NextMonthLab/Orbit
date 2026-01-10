import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Bookmark, MessageCircle, ExternalLink, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewPayload, AssistantResponse } from "@shared/orbitViewEngine";
import { CompareView } from "./CompareView";
import { ShortlistView } from "./ShortlistView";
import { ChecklistView } from "./ChecklistView";

interface ViewWindscreenProps {
  view: ViewPayload | null;
  followups?: string[];
  onClose: () => void;
  onAskAbout?: (query: string) => void;
  onFollowupClick?: (followup: string) => void;
  className?: string;
}

export function ViewWindscreen({ 
  view, 
  followups = [],
  onClose, 
  onAskAbout,
  onFollowupClick,
  className 
}: ViewWindscreenProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'sources' | 'saved'>('view');

  if (!view) return null;

  const renderView = () => {
    switch (view.type) {
      case 'compare':
        return (
          <CompareView 
            data={view.data} 
            onAskAbout={onAskAbout}
          />
        );
      case 'shortlist':
        return (
          <ShortlistView 
            data={view.data}
            onAskAbout={onAskAbout}
          />
        );
      case 'checklist':
        return (
          <ChecklistView 
            data={view.data}
          />
        );
      default:
        return (
          <div className="p-6 text-center text-white/60">
            <p>View type "{view.type}" coming soon</p>
          </div>
        );
    }
  };

  if (collapsed) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        onClick={() => setCollapsed(false)}
        className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 z-50",
          "w-12 h-32 rounded-l-xl",
          "bg-black/80 backdrop-blur-xl border border-white/10",
          "flex flex-col items-center justify-center gap-2",
          "hover:bg-black/90 transition-colors",
          className
        )}
        data-testid="expand-windscreen"
      >
        <ChevronLeft className="w-5 h-5 text-white/60" />
        <span className="text-xs text-white/60 [writing-mode:vertical-lr] rotate-180">
          View
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={cn(
        "fixed right-0 top-0 bottom-0 z-50",
        "w-[420px] max-w-[90vw]",
        "bg-black/95 backdrop-blur-2xl",
        "border-l border-white/10",
        "flex flex-col",
        "shadow-2xl shadow-black/50",
        className
      )}
      data-testid="windscreen-pane"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            data-testid="collapse-windscreen"
          >
            <ChevronRight className="w-4 h-4 text-white/60" />
          </button>
          <h2 className="text-sm font-medium text-white">
            {view.title || 'Active View'}
          </h2>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Save view"
          >
            <Bookmark className="w-4 h-4 text-white/40" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            data-testid="close-windscreen"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-white/10">
        {(['view', 'sources', 'saved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 px-4 py-2 text-xs font-medium transition-colors",
              activeTab === tab 
                ? "text-white border-b-2 border-pink-500" 
                : "text-white/40 hover:text-white/60"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'view' && renderView()}
        {activeTab === 'sources' && (
          <div className="p-6 text-center text-white/40 text-sm">
            No sources available for this view
          </div>
        )}
        {activeTab === 'saved' && (
          <div className="p-6 text-center text-white/40 text-sm">
            No saved views yet
          </div>
        )}
      </div>

      {followups.length > 0 && (
        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2">Continue exploring:</p>
          <div className="flex flex-wrap gap-2">
            {followups.map((followup, idx) => (
              <button
                key={idx}
                onClick={() => onFollowupClick?.(followup)}
                className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 transition-colors"
                data-testid={`followup-chip-${idx}`}
              >
                {followup}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function MobileViewSheet({
  view,
  followups = [],
  onClose,
  onAskAbout,
  onFollowupClick,
}: ViewWindscreenProps) {
  if (!view) return null;

  const renderView = () => {
    switch (view.type) {
      case 'compare':
        return <CompareView data={view.data} onAskAbout={onAskAbout} />;
      case 'shortlist':
        return <ShortlistView data={view.data} onAskAbout={onAskAbout} />;
      case 'checklist':
        return <ChecklistView data={view.data} />;
      default:
        return (
          <div className="p-6 text-center text-white/60">
            <p>View type "{view.type}" coming soon</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl flex flex-col"
      data-testid="mobile-view-sheet"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-medium text-white">
          {view.title || 'View'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          data-testid="close-mobile-view"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderView()}
      </div>

      {followups.length > 0 && (
        <div className="p-3 border-t border-white/10 bg-black/80">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {followups.map((followup, idx) => (
              <button
                key={idx}
                onClick={() => onFollowupClick?.(followup)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-white/5 text-white/80 hover:bg-white/10 border border-white/10"
                data-testid={`mobile-followup-${idx}`}
              >
                {followup}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
