import { useState } from "react";
import { composeTitleLines } from "@/caption-engine/layout/title";
import { resolveStyles } from "@/caption-engine/render/resolveStyles";
import { ScaleToFitCaption } from "@/components/ScaleToFitCaption";

const SAMPLE_HEADLINES = [
  "AI search",
  "AI search is here",
  "As generative AI tools become favored over traditional search",
  "An astonishing 58% of users now prefer using",
  "Understanding this shift is vital for businesses looking to stay competitive",
  "The future of search is conversational",
  "Why brands need to adapt now",
  "58%",
  "This changes everything",
  "Product research has evolved dramatically",
  "Consumers trust AI recommendations more than ads",
  "The data speaks for itself",
  "Here's what you need to know",
  "Three key insights for 2025",
  "AI is transforming how we discover products",
  "From search to conversation",
  "The numbers don't lie",
  "What this means for your business",
  "A paradigm shift in consumer behavior",
  "Ready or not, change is coming",
  "Supercalifragilisticexpialidocious",
  "https://example.com/very-long-url-that-should-not-break",
  "#HashtagThatIsVeryLongAndShouldNotBreak",
  "First. Second. Third.",
  "Why? Because it works.",
  "The question is simple: what's next?",
  "Introducing the next generation of AI",
  "Over 1 million users have already switched",
  "Join the movement today",
  "Your competitors are already adapting",
];

export default function CaptionComposerLab() {
  const [containerWidth] = useState(375);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-2">Caption Composer Lab</h1>
      <p className="text-gray-400 mb-6">
        TitleComposer output comparison. Container width: {containerWidth}px
      </p>

      <div className="space-y-8">
        {SAMPLE_HEADLINES.map((headline, idx) => {
          const composedLines = composeTitleLines(headline, { maxLines: 3 });
          const styles = resolveStyles({
            presetId: "clean_white",
            fullScreen: false,
            headlineText: headline,
            layout: { containerWidthPx: containerWidth },
          });

          return (
            <div
              key={idx}
              className="border border-gray-700 rounded-lg p-4 bg-gray-800"
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-xs text-gray-500 uppercase mb-1">Raw Text</h3>
                  <p className="text-sm font-mono text-gray-300">{headline}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {headline.split(/\s+/).length} words, {headline.length} chars
                  </p>
                </div>

                <div>
                  <h3 className="text-xs text-gray-500 uppercase mb-1">
                    Composed Lines ({composedLines.length})
                  </h3>
                  <div className="text-sm font-mono">
                    {composedLines.map((line, i) => (
                      <div key={i} className="text-cyan-400">
                        {i + 1}. "{line}"
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-gray-500 uppercase mb-1">Rendered</h3>
                  <div
                    className="relative bg-gray-950 rounded-lg p-2 flex items-center justify-center"
                    style={{ minHeight: "100px", width: `${containerWidth}px` }}
                  >
                    <ScaleToFitCaption
                      lines={styles.headlineLines}
                      panelStyle={styles.panel}
                      textStyle={styles.headline}
                      containerWidthPx={containerWidth}
                      maxHeightPx={120}
                      fittedFontSizePx={styles.headlineFontSizePx}
                      didFit={styles.headlineDidFit}
                      showDebug={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
