import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import engineerImage from "@assets/stock_images/engineer_working_in__08fad5a8.jpg";
import businessImage from "@assets/stock_images/business_professiona_dba1a455.jpg";
import teacherImage from "@assets/stock_images/teacher_educator_in__8c1ca5d7.jpg";
import filmmakerImage from "@assets/stock_images/filmmaker_director_r_bff3ccae.jpg";
import writerImage from "@assets/stock_images/creative_writer_work_c38a4245.jpg";

export type ScenarioAudience = "business" | "creator" | "educator" | "all";

export interface Scenario {
  id: string;
  title: string;
  audience: ScenarioAudience[];
  hasContent: string;
  doesWith: string;
  outcome: string;
  image: string;
}

export const allScenarios: Scenario[] = [
  {
    id: "innovative-business",
    title: "Innovative Manufacturer",
    audience: ["business", "all"],
    hasContent: "Dense technical documentation, CAD specifications, and engineering white papers that overwhelm potential customers and slow down sales cycles",
    doesWith: "Transforms product specs into an interactive experience where an AI engineer avatar walks prospects through features, answers technical questions in real-time, and demonstrates use cases visually",
    outcome: "Sales cycles shortened as prospects self-educate. Technical complexity becomes a competitive advantage instead of a barrier to adoption",
    image: engineerImage,
  },
  {
    id: "legacy-content",
    title: "Established Business with Legacy Content",
    audience: ["business", "all"],
    hasContent: "A decade of thoughtful blog posts, case studies, and industry insights sitting idle in archives, getting minimal traffic despite their value",
    doesWith: "Repurposes evergreen articles into cinematic short-form video content optimized for LinkedIn, TikTok, YouTube Shorts, and Instagram Reels—each piece retaining the original insight",
    outcome: "Years of expertise suddenly reaches new audiences. Content library becomes a living, growing asset instead of a forgotten archive",
    image: businessImage,
  },
  {
    id: "educator",
    title: "History Teacher",
    audience: ["educator", "all"],
    hasContent: "Dry curriculum materials and fact sheets that students skim but don't remember. Engagement drops, test scores plateau",
    doesWith: "Creates immersive lessons where historical figures come to life—Einstein explains relativity, Marie Curie discusses her discoveries, Lincoln debates the Gettysburg Address—all grounded in verified source material",
    outcome: "Students ask for extra lessons. Retention improves dramatically. Parents notice the difference at home",
    image: teacherImage,
  },
  {
    id: "filmmaker",
    title: "Independent Filmmaker",
    audience: ["creator", "all"],
    hasContent: "A polished screenplay, a clear creative vision, but limited budget to produce full pre-visualization for investor pitches or team alignment",
    doesWith: "Builds a living storyboard—AI-generated scenes that show exactly how shots will look, complete with lighting, composition, and mood. Cast and crew see the vision before day one of production",
    outcome: "Investors understand the vision immediately. Crew arrives prepared. Production runs smoother. Budget stays intact",
    image: filmmakerImage,
  },
  {
    id: "amateur-writer",
    title: "Aspiring Author",
    audience: ["creator", "all"],
    hasContent: "Unpublished short stories and novel chapters sitting in folders, never shared because 'nobody reads anymore' and traditional publishing feels impossible",
    doesWith: "Transforms written fiction into visual, shareable experiences—each chapter becomes an interactive episode with imagery, ambient audio, and optional character conversations",
    outcome: "Stories finally reach an audience. Readers become followers. A publishing platform becomes a portfolio that proves there's demand",
    image: writerImage,
  },
];

interface ScenarioCarouselProps {
  filter?: ScenarioAudience;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function ScenarioCarousel({
  filter = "all",
  showDots = true,
  autoPlay = true,
  autoPlayInterval = 12000,
}: ScenarioCarouselProps) {
  const scenarios = filter === "all" 
    ? allScenarios 
    : allScenarios.filter(s => s.audience.includes(filter));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % scenarios.length);
  }, [scenarios.length]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + scenarios.length) % scenarios.length);
  }, [scenarios.length]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, goToNext]);

  const currentScenario = scenarios[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full" data-testid="scenario-carousel">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentScenario.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="grid md:grid-cols-2 gap-0"
          >
            <div className="relative aspect-[4/3] md:aspect-auto">
              <img
                src={currentScenario.image}
                alt={currentScenario.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/80 md:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
            </div>

            <div className="p-8 md:p-10 flex flex-col justify-center bg-black/40 md:bg-transparent">
              <p className="text-pink-400 text-sm font-medium mb-2 uppercase tracking-wide">
                Scenario
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                {currentScenario.title}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">They have</p>
                  <p className="text-white/80">{currentScenario.hasContent}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">They use ICE to</p>
                  <p className="text-white/80">{currentScenario.doesWith}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">The outcome</p>
                  <p className="text-white">{currentScenario.outcome}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Previous scenario"
          data-testid="carousel-prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Next scenario"
          data-testid="carousel-next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {showDots && (
        <div className="flex justify-center gap-2 mt-6">
          {scenarios.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-pink-500 w-6"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to scenario ${index + 1}`}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
