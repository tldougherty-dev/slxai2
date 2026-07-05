import { supabase } from '@/lib/supabase';
import {
  LIBRARY_CURATED_RESOURCES,
  type LibraryContentType,
  type LibraryResource,
} from '@/data/libraryData';

function rowToResource(row: Record<string, unknown>): LibraryResource {
  const tags = row.tags;
  return {
    id: String(row.id),
    type: row.type as LibraryContentType,
    title: String(row.title),
    description: String(row.description || ''),
    url: String(row.url),
    source: row.source ? String(row.source) : undefined,
    signLanguage: row.sign_language ? String(row.sign_language) : undefined,
    tags: Array.isArray(tags) ? tags.map(String) : [],
  };
}

export async function getAllLibraryResources(): Promise<LibraryResource[]> {
  try {
    const { data, error } = await supabase
      .from('library_resources')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) {
      if (error.message?.includes('library_resources') || error.code === '42P01') {
        return [...LIBRARY_CURATED_RESOURCES];
      }
      throw error;
    }

    if (!data || data.length === 0) {
      return [...LIBRARY_CURATED_RESOURCES];
    }

    return data.map((row) => rowToResource(row));
  } catch {
    return [...LIBRARY_CURATED_RESOURCES];
  }
}

export async function getLibraryResourcesByType(type: LibraryContentType): Promise<LibraryResource[]> {
  const all = await getAllLibraryResources();
  return all.filter((r) => r.type === type);
}

export async function upsertLibraryResource(resource: LibraryResource): Promise<void> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resource.id);

  const row: Record<string, unknown> = {
    type: resource.type,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    source: resource.source || null,
    sign_language: resource.signLanguage || null,
    tags: resource.tags || [],
    updated_at: new Date().toISOString(),
  };

  if (isUuid) {
    row.id = resource.id;
  }

  const { error } = await supabase.from('library_resources').upsert(row, isUuid ? { onConflict: 'id' } : undefined);

  if (error) throw error;
}

export async function deleteLibraryResource(id: string): Promise<void> {
  const { error } = await supabase.from('library_resources').delete().eq('id', id);
  if (error) throw error;
}

export async function seedDefaultLibraryResources(): Promise<number> {
  let inserted = 0;
  for (const resource of LIBRARY_CURATED_RESOURCES) {
    await upsertLibraryResource(resource);
    inserted++;
  }
  return inserted;
}
