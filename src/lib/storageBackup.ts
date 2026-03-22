/**
 * Download Supabase Storage objects into a single ZIP (admin backup).
 * Buckets match app usage: portal files, avatars, feed images, flags.
 */
import JSZip from 'jszip';
import { supabase } from '@/lib/supabase';

const LIST_PAGE = 1000;

/** Storage buckets used by the SLxAI portal (see Files, MyProfile, feed, flags). */
export const STORAGE_BACKUP_BUCKETS = ['files', 'avatars', 'post-images', 'flags'] as const;

export type StorageBackupBucket = (typeof STORAGE_BACKUP_BUCKETS)[number];

/** Supabase Storage marks folder placeholders with `id: null`. */
function isFolder(item: { id: string | null }): boolean {
  return item.id === null;
}

/** Recursively list object paths (not folder placeholders) under prefix. */
export async function listAllObjectPaths(bucket: string, prefix = ''): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: LIST_PAGE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw new Error(error.message || `Failed to list bucket "${bucket}"`);
    }

    if (!data?.length) break;

    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (isFolder(item)) {
        const sub = await listAllObjectPaths(bucket, fullPath);
        paths.push(...sub);
      } else {
        paths.push(fullPath);
      }
    }

    if (data.length < LIST_PAGE) break;
    offset += LIST_PAGE;
  }

  return paths;
}

export interface StorageBackupManifest {
  exportedAt: string;
  version: number;
  buckets: {
    bucket: string;
    filesAdded: number;
    filesFailed: number;
    listError?: string;
    errors?: { path: string; message: string }[];
  }[];
  totalFiles: number;
  totalFailed: number;
}

/**
 * Build a ZIP of all readable objects in the configured buckets.
 * Paths inside the ZIP: `{bucket}/{path}` (e.g. `files/user-id/uuid_doc.pdf`).
 */
export async function buildStorageBackupZip(
  onProgress?: (message: string) => void
): Promise<{ blob: Blob; manifest: StorageBackupManifest }> {
  const zip = new JSZip();
  const manifest: StorageBackupManifest = {
    exportedAt: new Date().toISOString(),
    version: 1,
    buckets: [],
    totalFiles: 0,
    totalFailed: 0,
  };

  for (const bucket of STORAGE_BACKUP_BUCKETS) {
    const bucketErrors: { path: string; message: string }[] = [];
    let filesAdded = 0;
    let listError: string | undefined;

    try {
      onProgress?.(`Listing “${bucket}”…`);
      const paths = await listAllObjectPaths(bucket, '');
      onProgress?.(`Downloading “${bucket}” (${paths.length} files)…`);

      for (const path of paths) {
        const { data, error } = await supabase.storage.from(bucket).download(path);
        if (error || !data) {
          bucketErrors.push({
            path,
            message: error?.message || 'Download returned empty',
          });
          manifest.totalFailed++;
          continue;
        }
        const zipPath = `${bucket}/${path.replace(/\\/g, '/')}`;
        zip.file(zipPath, data);
        filesAdded++;
        manifest.totalFiles++;
      }
    } catch (e: unknown) {
      listError = e instanceof Error ? e.message : String(e);
    }

    manifest.buckets.push({
      bucket,
      filesAdded,
      filesFailed: bucketErrors.length,
      listError,
      errors: bucketErrors.length ? bucketErrors : undefined,
    });
  }

  zip.file(
    '_storage-backup-manifest.json',
    JSON.stringify(manifest, null, 2)
  );

  onProgress?.('Creating ZIP…');
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { blob, manifest };
}

export function triggerStorageBackupDownload(blob: Blob): void {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `slxai-storage-backup-${stamp}.zip`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
