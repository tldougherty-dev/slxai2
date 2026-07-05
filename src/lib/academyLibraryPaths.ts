export const ACADEMY_LIBRARY_PATH = '/membership-portal/academy';

export function academyLibraryTabUrl(tab: string): string {
  return `${ACADEMY_LIBRARY_PATH}?tab=${encodeURIComponent(tab)}`;
}

export function academyFileViewPath(fileId: string): string {
  return `${ACADEMY_LIBRARY_PATH}/files/${fileId}`;
}

export const ACADEMY_FILES_TAB_URL = academyLibraryTabUrl('files');
