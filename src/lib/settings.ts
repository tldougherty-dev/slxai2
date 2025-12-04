// Portal settings management - 100% Supabase, no localStorage
import { supabase } from './supabase';

export interface PortalSettings {
  memberRegistration: boolean;
  publicDirectory: boolean;
  emailNotifications: boolean;
  contentModeration: 'auto-approve' | 'require-approval';
}

const DEFAULT_SETTINGS: PortalSettings = {
  memberRegistration: true,
  publicDirectory: true,
  emailNotifications: true,
  contentModeration: 'auto-approve',
};

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

// Get settings
export async function getSettings(): Promise<PortalSettings> {
  try {
    const { data, error } = await supabase
      .from('portal_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single();

    if (error) {
      // If settings don't exist, return defaults
      if (error.code === 'PGRST116') {
        return DEFAULT_SETTINGS;
      }
      throw error;
    }

    if (!data) return DEFAULT_SETTINGS;

    return {
      memberRegistration: data.member_registration ?? DEFAULT_SETTINGS.memberRegistration,
      publicDirectory: data.public_directory ?? DEFAULT_SETTINGS.publicDirectory,
      emailNotifications: data.email_notifications ?? DEFAULT_SETTINGS.emailNotifications,
      contentModeration: (data.content_moderation as 'auto-approve' | 'require-approval') || DEFAULT_SETTINGS.contentModeration,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings
export async function saveSettings(settings: Partial<PortalSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };

    const { error } = await supabase
      .from('portal_settings')
      .upsert({
        id: SETTINGS_ID,
        member_registration: updated.memberRegistration,
        public_directory: updated.publicDirectory,
        email_notifications: updated.emailNotifications,
        content_moderation: updated.contentModeration,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// Reset settings to defaults
export async function resetSettings(): Promise<void> {
  await saveSettings(DEFAULT_SETTINGS);
}
