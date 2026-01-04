import OpenAI from "openai";
import crypto from "crypto";
import type { 
  ProjectBible, 
  CharacterBibleEntry, 
  WorldBible, 
  StyleBible,
  IcePreviewCard 
} from "@shared/schema";

function uuidv4(): string {
  return crypto.randomUUID();
}

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ 
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

interface GenerateBibleOptions {
  title: string;
  cards: IcePreviewCard[];
  sourceContent?: string;
}

export async function generateProjectBible(options: GenerateBibleOptions): Promise<ProjectBible> {
  const { title, cards, sourceContent } = options;
  const openai = getOpenAI();
  const now = new Date().toISOString();
  
  const cardsSummary = cards.map((c, i) => 
    `Card ${i + 1}: "${c.title}" - ${c.content?.slice(0, 200)}...`
  ).join("\n");
  
  const systemPrompt = `You are a story analyst creating a Project Bible for visual consistency in AI-generated media.

Analyze the story content and extract:
1. Character Bible: All named characters with physical descriptions, wardrobe, and distinguishing traits
2. World Bible: Setting, era, visual style, tone, and environment details
3. Style Bible: Recommended visual approach for AI image/video generation

For each character, identify 2-5 traits that should NEVER change (locked traits).
For the world, identify 2-5 world rules that should remain constant.

CRITICAL REQUIREMENTS:
- All generated media must have NO TEXT, NO WORDS, NO LETTERS, NO CAPTIONS
- Focus on visual descriptions that AI image generators can use
- Be specific about physical appearances (age, hair, skin, clothing)
- Infer era and setting from context clues

Respond in JSON format.`;

  const userPrompt = `Story Title: "${title}"

Story Content Summary:
${sourceContent ? sourceContent.slice(0, 3000) : cardsSummary}

Extract the Project Bible for this story. Include all named characters found, world setting details, and recommended visual style.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    const characters: CharacterBibleEntry[] = (parsed.characters || []).map((char: any) => ({
      id: uuidv4(),
      name: char.name || "Unknown",
      role: char.role,
      physicalTraits: {
        ageRange: char.physicalTraits?.ageRange || char.age,
        build: char.physicalTraits?.build || char.build,
        skinTone: char.physicalTraits?.skinTone || char.skinTone,
        hairStyle: char.physicalTraits?.hairStyle || char.hair?.style,
        hairColor: char.physicalTraits?.hairColor || char.hair?.color,
        facialFeatures: char.physicalTraits?.facialFeatures || char.facialFeatures,
        distinguishingMarks: char.physicalTraits?.distinguishingMarks || char.distinguishingMarks,
      },
      wardrobeRules: {
        signatureItems: char.wardrobeRules?.signatureItems || char.clothing?.items || [],
        colorPalette: char.wardrobeRules?.colorPalette || char.clothing?.colors || [],
        style: char.wardrobeRules?.style || char.clothing?.style,
      },
      mannerisms: char.mannerisms,
      lockedTraits: char.lockedTraits || [],
      referenceImages: [],
      createdAt: now,
      updatedAt: now,
    }));

    const world: WorldBible = {
      setting: {
        place: parsed.world?.setting?.place || parsed.setting?.location,
        era: parsed.world?.setting?.era || parsed.setting?.era,
        culture: parsed.world?.setting?.culture || parsed.setting?.culture,
      },
      visualLanguage: {
        cinematicStyle: parsed.world?.visualLanguage?.cinematicStyle || parsed.style?.cinematicStyle,
        lighting: parsed.world?.visualLanguage?.lighting || parsed.style?.lighting,
        lensVibe: parsed.world?.visualLanguage?.lensVibe || parsed.style?.lens,
        realismLevel: parsed.world?.visualLanguage?.realismLevel || "photorealistic",
      },
      environmentAnchors: (parsed.world?.environmentAnchors || parsed.locations || []).map((loc: any) => ({
        name: loc.name || loc,
        description: loc.description || "",
        visualDetails: loc.visualDetails,
      })),
      toneRules: {
        mood: parsed.world?.toneRules?.mood || parsed.tone?.mood,
        genre: parsed.world?.toneRules?.genre || parsed.tone?.genre,
      },
      lockedWorldTraits: parsed.world?.lockedWorldTraits || [],
      updatedAt: now,
    };

    const style: StyleBible = {
      aspectRatio: "9:16",
      noOnScreenText: true,
      realismLevel: parsed.style?.realismLevel || "photorealistic",
      colorGrading: parsed.style?.colorGrading,
      cameraMovement: parsed.style?.cameraMovement,
      additionalNegativePrompts: [
        "text", "words", "letters", "writing", "caption", "title", 
        "watermark", "signature", "logo", "subtitle"
      ],
      updatedAt: now,
    };

    return {
      versionId: uuidv4(),
      version: 1,
      characters,
      world,
      style,
      createdAt: now,
      updatedAt: now,
      updatedBy: "system",
    };
  } catch (error) {
    console.error("Error generating project bible:", error);
    return {
      versionId: uuidv4(),
      version: 1,
      characters: [],
      world: {
        lockedWorldTraits: [],
      },
      style: {
        aspectRatio: "9:16",
        noOnScreenText: true,
        additionalNegativePrompts: ["text", "words", "letters", "watermark"],
      },
      createdAt: now,
      updatedAt: now,
      updatedBy: "system",
    };
  }
}

export function createNewBibleVersion(existingBible: ProjectBible, updatedBy: string): ProjectBible {
  const now = new Date().toISOString();
  return {
    ...existingBible,
    versionId: uuidv4(),
    version: existingBible.version + 1,
    updatedAt: now,
    updatedBy,
  };
}

export function addCharacterToBible(
  bible: ProjectBible, 
  character: Omit<CharacterBibleEntry, 'id' | 'createdAt' | 'updatedAt'>
): ProjectBible {
  const now = new Date().toISOString();
  const newCharacter: CharacterBibleEntry = {
    ...character,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  return {
    ...bible,
    versionId: uuidv4(),
    version: bible.version + 1,
    characters: [...bible.characters, newCharacter],
    updatedAt: now,
  };
}

export function updateCharacterInBible(
  bible: ProjectBible,
  characterId: string,
  updates: Partial<CharacterBibleEntry>
): ProjectBible {
  const now = new Date().toISOString();
  
  return {
    ...bible,
    versionId: uuidv4(),
    version: bible.version + 1,
    characters: bible.characters.map(char => 
      char.id === characterId 
        ? { ...char, ...updates, updatedAt: now }
        : char
    ),
    updatedAt: now,
  };
}

export function removeCharacterFromBible(bible: ProjectBible, characterId: string): ProjectBible {
  const now = new Date().toISOString();
  
  return {
    ...bible,
    versionId: uuidv4(),
    version: bible.version + 1,
    characters: bible.characters.filter(char => char.id !== characterId),
    updatedAt: now,
  };
}
