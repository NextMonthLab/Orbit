export interface KlingConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TextToVideoRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  duration?: 5 | 10;
  model?: "kling-v1" | "kling-v1-5" | "kling-v2" | "kling-v2-master";
  cfgScale?: number;
}

export interface ImageToVideoRequest {
  imageUrl: string;
  prompt?: string;
  negativePrompt?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  duration?: 5 | 10;
  model?: "kling-v1" | "kling-v1-5" | "kling-v2" | "kling-v2-master";
  cfgScale?: number;
}

export interface VideoGenerationTask {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
  progress?: number;
}

export interface KlingVideoResult {
  taskId: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
}

const KLING_API_BASE = "https://api.klingai.com";
const POLL_INTERVAL_MS = 10000;
const MAX_POLL_ATTEMPTS = 120;

export function isKlingConfigured(): boolean {
  return !!process.env.KLING_API_KEY;
}

export function getKlingConfig(): KlingConfig | null {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) return null;
  
  return {
    apiKey,
    baseUrl: process.env.KLING_API_BASE || KLING_API_BASE,
  };
}

async function makeKlingRequest(
  endpoint: string,
  method: "GET" | "POST",
  body?: any
): Promise<any> {
  const config = getKlingConfig();
  if (!config) throw new Error("Kling API not configured");
  
  const url = `${config.baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kling API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

export async function startTextToVideoGeneration(
  request: TextToVideoRequest
): Promise<string> {
  const payload = {
    model_name: request.model || "kling-v2",
    prompt: request.prompt,
    negative_prompt: request.negativePrompt || "blurry, low quality, distorted",
    aspect_ratio: request.aspectRatio || "9:16",
    duration: String(request.duration || 5),
    cfg_scale: request.cfgScale || 0.5,
    mode: "std",
  };
  
  const response = await makeKlingRequest("/v1/videos/text2video", "POST", payload);
  
  if (!response.data?.task_id) {
    throw new Error("Failed to start video generation: No task ID returned");
  }
  
  return response.data.task_id;
}

export async function startImageToVideoGeneration(
  request: ImageToVideoRequest
): Promise<string> {
  const payload = {
    model_name: request.model || "kling-v2",
    image: request.imageUrl,
    prompt: request.prompt || "",
    negative_prompt: request.negativePrompt || "blurry, low quality, distorted",
    aspect_ratio: request.aspectRatio || "9:16",
    duration: String(request.duration || 5),
    cfg_scale: request.cfgScale || 0.5,
    mode: "std",
  };
  
  const response = await makeKlingRequest("/v1/videos/image2video", "POST", payload);
  
  if (!response.data?.task_id) {
    throw new Error("Failed to start video generation: No task ID returned");
  }
  
  return response.data.task_id;
}

export async function checkVideoStatus(taskId: string): Promise<KlingVideoResult> {
  const response = await makeKlingRequest(`/v1/videos/text2video/${taskId}`, "GET");
  
  const data = response.data;
  
  if (!data) {
    return {
      taskId,
      status: "pending",
    };
  }
  
  const statusMap: Record<string, string> = {
    "submitted": "pending",
    "processing": "processing",
    "succeed": "completed",
    "failed": "failed",
  };
  
  const result: KlingVideoResult = {
    taskId,
    status: statusMap[data.task_status] || data.task_status,
  };
  
  if (data.task_status === "succeed" && data.task_result?.videos?.[0]) {
    const video = data.task_result.videos[0];
    result.videoUrl = video.url;
    result.thumbnailUrl = video.cover_image_url;
    result.duration = parseFloat(video.duration) || undefined;
  }
  
  if (data.task_status === "failed") {
    result.error = data.task_status_msg || "Video generation failed";
  }
  
  return result;
}

export async function waitForVideoCompletion(
  taskId: string,
  onProgress?: (status: KlingVideoResult) => void
): Promise<KlingVideoResult> {
  let attempts = 0;
  
  while (attempts < MAX_POLL_ATTEMPTS) {
    const result = await checkVideoStatus(taskId);
    
    if (onProgress) {
      onProgress(result);
    }
    
    if (result.status === "completed" || result.status === "failed") {
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    attempts++;
  }
  
  return {
    taskId,
    status: "failed",
    error: "Video generation timed out",
  };
}

export function getKlingModels() {
  return [
    { id: "kling-v1", name: "Kling 1.0", description: "Standard quality, fast generation" },
    { id: "kling-v1-5", name: "Kling 1.5", description: "Improved quality and motion" },
    { id: "kling-v2", name: "Kling 2.0", description: "High quality, realistic motion" },
    { id: "kling-v2-master", name: "Kling 2.0 Master", description: "Highest quality, hyper-realistic" },
  ];
}

export function estimateVideoCredits(duration: number, model: string): number {
  const baseCredits: Record<string, number> = {
    "kling-v1": 1,
    "kling-v1-5": 2,
    "kling-v2": 3,
    "kling-v2-master": 5,
  };
  
  const base = baseCredits[model] || 3;
  return duration === 10 ? base * 2 : base;
}
