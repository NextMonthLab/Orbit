import { Lightbulb, MessageCircle } from "lucide-react";
import type { FrontPageStartHere, FrontPageSection } from "@/lib/types/industryOrbitFrontPage";

interface StartHereGridProps {
  startHere: FrontPageSection<FrontPageStartHere>;
}

export function StartHereGrid({ startHere }: StartHereGridProps) {
  if (!startHere.visible || startHere.count === 0) return null;

  return (
    <section className="py-12 px-4 border-t border-zinc-800 bg-zinc-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Start Here</h2>
        </div>
        <p className="text-zinc-400 mb-8">
          Key topics to understand before diving deeper
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {startHere.items.map((topic) => (
            <div
              key={topic.id}
              className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/30 transition-colors"
              data-testid={`start-here-${topic.id}`}
            >
              <h3 className="font-semibold text-white mb-2">{topic.label}</h3>
              
              {topic.whyItMatters && (
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                  {topic.whyItMatters}
                </p>
              )}

              {topic.starterQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
                    <MessageCircle className="w-3 h-3" />
                    Starter questions
                  </div>
                  <ul className="space-y-1.5">
                    {topic.starterQuestions.map((q, i) => (
                      <li key={i} className="text-sm text-zinc-300 pl-3 border-l border-zinc-700">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
