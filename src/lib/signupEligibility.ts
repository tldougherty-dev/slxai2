import { supabase } from '@/lib/supabase';

export type SignupEligibility = {
  allowed: boolean;
  reason?: string;
};

/**
 * Sign-up is allowed only for emails pre-approved by an admin (pending member_person row).
 * Email verification is handled by Supabase Auth after signUp().
 */
export async function checkSignupEligibility(email: string): Promise<SignupEligibility> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { allowed: false, reason: 'Please enter a valid email address.' };
  }

  const { data: person, error } = await supabase
    .from('member_persons')
    .select('status, email, members(status)')
    .ilike('email', normalized)
    .maybeSingle();

  if (error) {
    if (import.meta.env.DEV) {
      console.error('checkSignupEligibility:', error);
    }
    return {
      allowed: false,
      reason: 'Unable to verify approval status. Please try again or contact support.',
    };
  }

  if (!person) {
    return {
      allowed: false,
      reason:
        'This email has not been approved yet. Submit the interest form at /interest and wait for admin approval.',
    };
  }

  const memberStatus = (person.members as { status?: string } | null)?.status;
  const personStatus = person.status;

  if (personStatus === 'pending' || memberStatus === 'pending') {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason:
      'This email is already registered or active. Try signing in, or contact an administrator if you need help.',
  };
}
