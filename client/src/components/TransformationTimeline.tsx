import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StageStatuses {
  stage0: "pending" | "running" | "done" | "failed";
  stage1: "pending" | "running" | "done" | "failed";
  stage2: "pending" | "running" | "done" | "failed";
  stage3: "pending" | "running" | "done" | "failed";
  stage4: "pending" | "running" | "done" | "failed";
  stage5: "pending" | "running" | "done" | "failed";
}

interface StageArtifact {
  detected_type?: string;
  parse_confidence?: number;
  outline_count?: number;
  structure_summary?: string;
  voice_notes?: string;
  key_sections?: string[];
  theme_statement?: string;
  tone_tags?: string[];
  genre_guess?: string;
  audience_guess?: string;
  characters?: Array<{ id: string; name: string; role?: string }>;
  locations?: Array<{ id: string; name: string }>;
  world_rules?: string[];
  card_count?: number;
  hook_enabled?: boolean;
  card_plan?: Array<{ dayIndex: number; title: string; intent?: string }>;
  cards_drafted?: boolean;
  image_prompts_ready?: boolean;
  chat_prompts_ready?: boolean;
  discussion_prompts_ready?: boolean;
}

interface StageArtifacts {
  stage0?: StageArtifact;
  stage1?: StageArtifact;
  stage2?: StageArtifact;
  stage3?: StageArtifact;
  stage4?: StageArtifact;
  stage5?: StageArtifact;
}

interface TransformationTimelineProps {
  stageStatuses: StageStatuses;
  artifacts: StageArtifacts;
  currentStage: number;
  status: "queued" | "running" | "completed" | "failed";
  errorMessage?: string | null;
  onRetry?: () => void;
}

const STAGE_INFO = [
  { name: "Normalising your input", description: "Processing and preparing your source material" },
  { name: "Reading the material", description: "Understanding the structure and voice" },
  { name: "Identifying the story", description: "Finding the theme and emotional core" },
  { name: "Extracting the world", description: "Discovering characters and locations" },
  { name: "Shaping the moments", description: "Planning the cards and pacing" },
  { name: "Crafting the experience", description: "Final polish and creating your universe" },
];

function StageIcon({ status }: { status: "pending" | "running" | "done" | "failed" }) {
  if (status === "done") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center shadow-sm"
      >
        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </motion.div>
    );
  }
  
  if (status === "running") {
    return (
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-md shadow-purple-500/30"
      >
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
      </motion.div>
    );
  }
  
  if (status === "failed") {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
    );
  }
  
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-400 dark:bg-gray-500" />
    </div>
  );
}

function ArtifactSummary({ stageIndex, artifact }: { stageIndex: number; artifact?: StageArtifact }) {
  if (!artifact) return null;
  
  switch (stageIndex) {
    case 0:
      return (
        <div className="text-sm text-muted-foreground" data-testid={`artifact-summary-${stageIndex}`}>
          {artifact.detected_type && (
            <span>Detected: <strong className="text-foreground capitalize">{artifact.detected_type}</strong></span>
          )}
          {artifact.parse_confidence && (
            <span className="ml-2">({Math.round(artifact.parse_confidence * 100)}% confidence)</span>
          )}
        </div>
      );
    case 1:
      return (
        <div className="text-sm text-muted-foreground" data-testid={`artifact-summary-${stageIndex}`}>
          {artifact.structure_summary}
        </div>
      );
    case 2:
      return (
        <div className="text-sm text-muted-foreground" data-testid={`artifact-summary-${stageIndex}`}>
          {artifact.theme_statement && <div>Theme: "{artifact.theme_statement}"</div>}
          {artifact.tone_tags && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {artifact.tone_tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    case 3:
      return (
        <div className="text-sm text-muted-foreground" data-testid={`artifact-summary-${stageIndex}`}>
          {artifact.characters && (
            <div>Found {artifact.characters.length} character{artifact.characters.length !== 1 ? "s" : ""}</div>
          )}
          {artifact.locations && (
            <div>Found {artifact.locations.length} location{artifact.locations.length !== 1 ? "s" : ""}</div>
          )}
        </div>
      );
    case 4:
      return (
        <div className="text-sm text-muted-foreground" data-testid={`artifact-summary-${stageIndex}`}>
          {artifact.card_count && <div>{artifact.card_count} cards planned</div>}
          {artifact.hook_enabled && <div className="text-green-600">Hook pack enabled</div>}
        </div>
      );
    case 5:
      return (
        <div className="text-sm text-muted-foreground" data-testid={`artifact-summary-${stageIndex}`}>
          {artifact.cards_drafted && <div className="text-green-600">Cards created successfully</div>}
        </div>
      );
    default:
      return null;
  }
}

function ArtifactDetails({ stageIndex, artifact }: { stageIndex: number; artifact?: StageArtifact }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!artifact) return null;
  
  const hasDetails = Object.keys(artifact).length > 0;
  if (!hasDetails) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" data-testid={`toggle-details-${stageIndex}`}>
          {isOpen ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
          {isOpen ? "Hide details" : "Show details"}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm space-y-2" data-testid={`artifact-details-${stageIndex}`}>
          {stageIndex === 3 && artifact.characters && (
            <div>
              <div className="font-medium mb-1">Characters:</div>
              <div className="flex flex-wrap gap-1">
                {artifact.characters.map((char) => (
                  <span key={char.id} className="px-2 py-0.5 bg-background rounded text-xs">
                    {char.name} {char.role && <span className="text-muted-foreground">({char.role})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
          {stageIndex === 3 && artifact.locations && (
            <div>
              <div className="font-medium mb-1">Locations:</div>
              <div className="flex flex-wrap gap-1">
                {artifact.locations.map((loc) => (
                  <span key={loc.id} className="px-2 py-0.5 bg-background rounded text-xs">
                    {loc.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {stageIndex === 4 && artifact.card_plan && (
            <div>
              <div className="font-medium mb-1">Card Plan:</div>
              <div className="space-y-1">
                {artifact.card_plan.map((card) => (
                  <div key={card.dayIndex} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-muted-foreground">D{card.dayIndex}</span>
                    <span>{card.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stageIndex === 1 && artifact.key_sections && (
            <div>
              <div className="font-medium mb-1">Key Sections:</div>
              <div className="flex flex-wrap gap-1">
                {artifact.key_sections.map((section, i) => (
                  <span key={i} className="px-2 py-0.5 bg-background rounded text-xs">
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}
          {stageIndex === 2 && artifact.genre_guess && (
            <div>Genre: <span className="capitalize">{artifact.genre_guess}</span></div>
          )}
          {stageIndex === 2 && artifact.audience_guess && (
            <div>Audience: {artifact.audience_guess}</div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TransformationTimeline({
  stageStatuses,
  artifacts,
  currentStage,
  status,
  errorMessage,
  onRetry,
}: TransformationTimelineProps) {
  const completedStages = Object.values(stageStatuses).filter((s) => s === "done").length;
  const progressPercent = Math.round((completedStages / 6) * 100);
  
  return (
    <Card className="w-full" data-testid="transformation-timeline">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base sm:text-lg">Story Transformation</CardTitle>
          <span className="text-xs sm:text-sm font-medium text-primary">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" data-testid="progress-bar" />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-300 via-gray-200 to-gray-200 dark:from-green-700 dark:via-gray-700 dark:to-gray-700" />
          
          <div className="space-y-4 sm:space-y-6">
            {STAGE_INFO.map((stage, index) => {
              const stageKey = `stage${index}` as keyof StageStatuses;
              const stageStatus = stageStatuses[stageKey];
              const stageArtifact = artifacts[stageKey as keyof StageArtifacts];
              
              return (
                <div key={index} className="relative pl-10 sm:pl-12" data-testid={`stage-${index}`}>
                  <div className="absolute left-0 top-0 -translate-x-0.5">
                    <StageIcon status={stageStatus} />
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h4 className={`text-sm sm:text-base font-medium uppercase tracking-wide ${
                        stageStatus === "running" ? "text-purple-600 dark:text-purple-400" : 
                        stageStatus === "done" ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {stage.name}
                      </h4>
                      {stageStatus === "running" && (
                        <span className="text-xs text-purple-500 dark:text-purple-400 font-medium animate-pulse">
                          In progress...
                        </span>
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {stageStatus === "done" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-1"
                        >
                          <ArtifactSummary stageIndex={index} artifact={stageArtifact} />
                          <ArtifactDetails stageIndex={index} artifact={stageArtifact} />
                        </motion.div>
                      )}
                      
                      {stageStatus === "failed" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                        >
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {errorMessage || "Something went wrong at this stage."}
                          </p>
                          {onRetry && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={onRetry}
                              data-testid="retry-button"
                            >
                              Retry from here
                            </Button>
                          )}
                        </motion.div>
                      )}
                      
                      {stageStatus === "pending" && index === currentStage && status === "queued" && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Waiting to start...</p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {status === "completed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-5 sm:mt-6 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700 text-center"
            data-testid="completion-message"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-3">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
              Your story is ready!
            </h3>
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1.5">
              Your universe has been created with all characters, locations, and cards.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default TransformationTimeline;
