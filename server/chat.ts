import { Universe, Character, Card, ChatPolicy, ChatProfile, ChatOverrides } from "@shared/schema";

interface ChatContext {
  universe: Universe;
  character: Character;
  currentCard?: Card;
  userDayIndex: number;
}

export function buildChatSystemPrompt(ctx: ChatContext): string {
  const { universe, character, currentCard, userDayIndex } = ctx;
  
  const policy = universe.chatPolicy as ChatPolicy | null;
  const profile = character.chatProfile as ChatProfile | null;
  const overrides = currentCard?.chatOverrides as ChatOverrides | null;
  const charOverride = overrides?.[character.characterSlug];

  const sections: string[] = [];
  
  sections.push(`You are ${character.name}, a character in the story "${universe.name}".`);
  if (character.role) {
    sections.push(`Your role: ${character.role}`);
  }
  if (character.description) {
    sections.push(`About you: ${character.description}`);
  }
  
  if (profile?.voice) {
    sections.push(`\nVOICE: ${profile.voice}`);
  }
  if (profile?.speech_style) {
    sections.push(`SPEECH STYLE: ${profile.speech_style}`);
  }
  if (charOverride?.mood) {
    sections.push(`CURRENT MOOD: ${charOverride.mood}`);
  }
  
  if (profile?.goals && profile.goals.length > 0) {
    sections.push(`\nYOUR GOALS IN THIS CONVERSATION:\n${profile.goals.map(g => `- ${g}`).join('\n')}`);
  }
  
  const knowsUpTo = charOverride?.knows_up_to_dayIndex ?? 
    (profile?.knowledge?.knows_up_to_dayIndex === "dynamic" ? userDayIndex : profile?.knowledge?.knows_up_to_dayIndex) ?? 
    userDayIndex;
  
  if (profile?.knowledge?.spoiler_protection !== false) {
    sections.push(`\nKNOWLEDGE LIMIT: You only know events up to day ${knowsUpTo} of the story. Do not reveal or discuss any plot points beyond this day. If asked about future events, respond naturally as the character would - you genuinely don't know what happens next.`);
  }
  
  const blockedTopics = [
    ...(profile?.blocked_topics || []),
    ...(charOverride?.refuse_topics || [])
  ];
  if (blockedTopics.length > 0) {
    sections.push(`\nTOPICS YOU REFUSE TO DISCUSS:\n${blockedTopics.map(t => `- ${t}`).join('\n')}`);
  }
  
  if (profile?.allowed_topics && profile.allowed_topics.length > 0) {
    sections.push(`\nTOPICS YOU'RE WILLING TO DISCUSS:\n${profile.allowed_topics.map(t => `- ${t}`).join('\n')}`);
  }
  
  if (charOverride?.can_reveal && charOverride.can_reveal.length > 0) {
    sections.push(`\nTHINGS YOU CAN NOW REVEAL (because of recent story events):\n${charOverride.can_reveal.map(r => `- ${r}`).join('\n')}`);
  }
  
  if (profile?.hard_limits && profile.hard_limits.length > 0) {
    sections.push(`\nHARD LIMITS (never break character on these):\n${profile.hard_limits.map(l => `- ${l}`).join('\n')}`);
  }
  
  if (character.secretsJson && Array.isArray(character.secretsJson) && character.secretsJson.length > 0) {
    sections.push(`\nYOUR SECRETS (never reveal directly, but they influence your behavior):\n${character.secretsJson.map((s: string) => `- ${s}`).join('\n')}`);
  }
  
  if (profile?.refusal_style) {
    sections.push(`\nWhen declining to discuss something, ${profile.refusal_style}`);
  }
  
  if (policy?.global_rules && policy.global_rules.length > 0) {
    sections.push(`\nUNIVERSE RULES (apply to all characters):\n${policy.global_rules.map(r => `- ${r}`).join('\n')}`);
  }
  
  if (policy?.blocked_personas && policy.blocked_personas.length > 0) {
    sections.push(`\nNEVER pretend to be or roleplay as:\n${policy.blocked_personas.map(p => `- ${p}`).join('\n')}`);
  }
  
  const safetyRules: string[] = [];
  const safety = policy?.safety ?? { no_harassment: true, no_self_harm_guidance: true, no_sexual_content: true, no_illegal_instructions: true };
  if (safety.no_harassment) safetyRules.push("Never engage in or encourage harassment, bullying, or personal attacks");
  if (safety.no_self_harm_guidance) safetyRules.push("Never provide guidance on self-harm or suicide");
  if (safety.no_sexual_content) safetyRules.push("Keep all content appropriate - no explicit sexual content");
  if (safety.no_illegal_instructions) safetyRules.push("Never provide instructions for illegal activities");
  
  if (safetyRules.length > 0) {
    sections.push(`\nSAFETY GUIDELINES:\n${safetyRules.map(r => `- ${r}`).join('\n')}`);
  }
  
  sections.push(`\nIMPORTANT: Stay in character at all times. Respond as ${character.name} would, with their personality and knowledge. Keep responses conversational and engaging, typically 2-4 sentences unless the question requires more detail.`);
  
  return sections.join('\n');
}

export function getChatDisclaimer(policy: ChatPolicy | null): string | null {
  if (!policy?.disclaimer) return null;
  return policy.disclaimer;
}
