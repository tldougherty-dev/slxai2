export const LIBRARY_PATH = '/membership-portal/library';

export type LibraryTabParam = string;

export function libraryTabUrl(tab: string): string {
  return `${LIBRARY_PATH}?tab=${encodeURIComponent(tab)}`;
}

export function libraryFileViewPath(fileId: string): string {
  return `${LIBRARY_PATH}/files/${fileId}`;
}

export const LIBRARY_UPLOAD_TAB_URL = libraryTabUrl('upload');

/** @deprecated Use LIBRARY_UPLOAD_TAB_URL */
export const ACADEMY_FILES_TAB_URL = LIBRARY_UPLOAD_TAB_URL;

/** @deprecated Use libraryFileViewPath */
export function academyFileViewPath(fileId: string): string {
  return libraryFileViewPath(fileId);
}

/** @deprecated Use LIBRARY_PATH */
export const ACADEMY_LIBRARY_PATH = LIBRARY_PATH;

/** @deprecated Use libraryTabUrl */
export function academyLibraryTabUrl(tab: string): string {
  return libraryTabUrl(tab);
}
