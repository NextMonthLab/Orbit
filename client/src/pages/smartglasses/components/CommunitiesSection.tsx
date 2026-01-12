import { Users, ExternalLink, Globe, Newspaper } from "lucide-react";
import type { FrontPageCommunity, FrontPageSource, FrontPageSection } from "@/lib/types/industryOrbitFrontPage";

interface CommunitiesSectionProps {
  communities: FrontPageSection<FrontPageCommunity>;
  sources: FrontPageSection<FrontPageSource>;
}

const communityIcons: Record<string, React.ReactNode> = {
  subreddit: <span className="text-orange-400 font-bold text-xs">r/</span>,
  discord: <span className="text-indigo-400 text-xs">Discord</span>,
  forum: <Users className="w-4 h-4 text-blue-400" />,
  community_site: <Globe className="w-4 h-4 text-green-400" />,
};

const sourceIcons: Record<string, React.ReactNode> = {
  manufacturer: <span className="text-emerald-400 text-xs">Official</span>,
  publication: <Newspaper className="w-4 h-4 text-blue-400" />,
  community: <Users className="w-4 h-4 text-purple-400" />,
};

export function CommunitiesSection({ communities, sources }: CommunitiesSectionProps) {
  const showCommunities = communities.visible && communities.count > 0;
  const showSources = sources.visible && sources.count > 0;
  
  if (!showCommunities && !showSources) return null;

  return (
    <section className="py-12 px-4 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {showCommunities && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Communities</h2>
                <span className="text-sm text-zinc-500">({communities.count})</span>
              </div>

              <div className="space-y-3">
                {communities.items.map((community) => (
                  <a
                    key={community.id}
                    href={community.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900 transition-colors group"
                    data-testid={`community-${community.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        {communityIcons[community.communityType] || <Globe className="w-4 h-4 text-zinc-400" />}
                      </div>
                      <div>
                        <span className="font-medium text-white text-sm">{community.name}</span>
                        {community.regionTags.length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {community.regionTags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs text-zinc-500">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {showSources && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Newspaper className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">Sources</h2>
                <span className="text-sm text-zinc-500">({sources.count})</span>
              </div>

              <div className="space-y-3">
                {sources.items.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900 transition-colors group"
                    data-testid={`source-${source.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        {sourceIcons[source.sourceType] || <Globe className="w-4 h-4 text-zinc-400" />}
                      </div>
                      <div>
                        <span className="font-medium text-white text-sm">{source.name}</span>
                        <div className="text-xs text-zinc-500 capitalize">{source.trustLevel}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
