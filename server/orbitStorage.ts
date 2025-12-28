import { objectStorageClient } from "./replit_integrations/object_storage/objectStorage";
import { OrbitPackV1, getPackStorageKey, orbitPackV1Schema } from "../shared/orbitPack";

function getBucketName(): string {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) {
    throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID not set");
  }
  return bucketId;
}

export interface StorageResult {
  success: boolean;
  key?: string;
  error?: string;
}

export async function storeOrbitPack(
  businessSlug: string,
  version: string,
  pack: OrbitPackV1
): Promise<StorageResult> {
  try {
    const bucketName = getBucketName();
    const key = getPackStorageKey(businessSlug, version);
    
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(key);
    
    const jsonContent = JSON.stringify(pack, null, 2);
    
    await file.save(jsonContent, {
      contentType: "application/json",
      resumable: false,
    });
    
    console.log(`[OrbitStorage] Stored pack: ${key}`);
    
    return {
      success: true,
      key,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[OrbitStorage] Failed to store pack:`, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface FetchResult {
  success: boolean;
  pack?: OrbitPackV1;
  error?: string;
}

export async function fetchOrbitPack(
  businessSlug: string,
  version: string
): Promise<FetchResult> {
  try {
    const bucketName = getBucketName();
    const key = getPackStorageKey(businessSlug, version);
    
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(key);
    
    const [exists] = await file.exists();
    if (!exists) {
      return {
        success: false,
        error: `Pack not found: ${key}`,
      };
    }
    
    const [content] = await file.download();
    const packData = JSON.parse(content.toString("utf-8"));
    
    const validated = orbitPackV1Schema.safeParse(packData);
    if (!validated.success) {
      return {
        success: false,
        error: `Invalid pack data: ${validated.error.message}`,
      };
    }
    
    return {
      success: true,
      pack: validated.data,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[OrbitStorage] Failed to fetch pack:`, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function fetchOrbitPackByKey(key: string): Promise<FetchResult> {
  try {
    const bucketName = getBucketName();
    
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(key);
    
    const [exists] = await file.exists();
    if (!exists) {
      return {
        success: false,
        error: `Pack not found: ${key}`,
      };
    }
    
    const [content] = await file.download();
    const packData = JSON.parse(content.toString("utf-8"));
    
    const validated = orbitPackV1Schema.safeParse(packData);
    if (!validated.success) {
      return {
        success: false,
        error: `Invalid pack data: ${validated.error.message}`,
      };
    }
    
    return {
      success: true,
      pack: validated.data,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[OrbitStorage] Failed to fetch pack by key:`, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function listOrbitPackVersions(
  businessSlug: string
): Promise<{ versions: string[]; error?: string }> {
  try {
    const bucketName = getBucketName();
    const prefix = `orbits/${businessSlug}/`;
    
    const bucket = objectStorageClient.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix });
    
    const versions = files
      .map((file) => {
        const match = file.name.match(/pack-v1-(.+)\.json$/);
        return match ? match[1] : null;
      })
      .filter((v): v is string => v !== null)
      .sort()
      .reverse();
    
    return { versions };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[OrbitStorage] Failed to list versions:`, error);
    return {
      versions: [],
      error: errorMessage,
    };
  }
}

export async function deleteOrbitPack(
  businessSlug: string,
  version: string
): Promise<StorageResult> {
  try {
    const bucketName = getBucketName();
    const key = getPackStorageKey(businessSlug, version);
    
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(key);
    
    await file.delete();
    
    console.log(`[OrbitStorage] Deleted pack: ${key}`);
    
    return {
      success: true,
      key,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[OrbitStorage] Failed to delete pack:`, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
