// Member email matching - automatically link users to their member profiles
import { supabase } from './supabase';
import { maxPrivilegeRole } from './roles';

export interface MemberMatch {
  memberId: string;
  organizationName: string;
  personId: string;
  personName: string;
  personTitle?: string;
  isVotingRep: boolean;
}

/**
 * Find a member person by email address
 * Returns the member organization and person details if found
 */
export async function findMemberByEmail(email: string): Promise<MemberMatch | null> {
  try {
    // Search in member_persons table for matching email (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase();
    
    const { data: personsData, error } = await supabase
      .from('member_persons')
      .select(`
        id,
        name,
        email,
        title,
        is_voting_rep,
        member_id
      `)
      .ilike('email', normalizedEmail)
      .limit(1);

    if (error || !personsData || personsData.length === 0) {
      return null;
    }

    const personData = personsData[0];

    // Fetch member details
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('id, organization_name')
      .eq('id', personData.member_id)
      .single();

    if (memberError || !memberData) {
      return null;
    }

    return {
      memberId: memberData.id,
      organizationName: memberData.organization_name,
      personId: personData.id,
      personName: personData.name,
      personTitle: personData.title || undefined,
      isVotingRep: personData.is_voting_rep || false,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error finding member by email:', error);
    }
    return null;
  }
}

/**
 * Update user metadata to link them to their member profile
 */
export async function linkUserToMember(userId: string, match: MemberMatch, existingRole?: string): Promise<void> {
  try {
    // Try updating via user session (most reliable method)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || currentUser.id !== userId) {
      console.warn('Cannot update user metadata: user mismatch');
      return;
    }
    
    // Never downgrade role when linking org metadata (admin/super_admin/voting_member vs member)
    const currentRole = currentUser.user_metadata?.role as string | undefined;
    const preservedRole = maxPrivilegeRole(currentRole, existingRole);
    
    // Update via user metadata update
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...currentUser.user_metadata,
        organization_id: match.memberId,
        name: match.personName,
        role: preservedRole, // Preserve admin role if it exists
        is_voting_rep: match.isVotingRep,
      },
    });

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating user metadata:', updateError);
      }
      throw updateError;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error linking user to member:', error);
    }
    // Don't throw - this is a background operation
  }
}

/**
 * Create a new organization and member person for a user
 */
export async function createOrganizationForUser(
  userId: string,
  email: string,
  name: string,
  organizationName: string,
  country: string
): Promise<MemberMatch | null> {
  try {
    const { supabase } = await import('./supabase');
    
    // Check if email is confirmed to determine status
    const { data: { user } } = await supabase.auth.getUser();
    const roleFromSession = user?.user_metadata?.role as string | undefined;
    const isEmailConfirmed = user?.email_confirmed_at !== null;
    const status = isEmailConfirmed ? 'active' : 'pending';
    
    // Create the organization in members table
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .insert({
        organization_name: organizationName,
        country: country || 'United States of America', // Use provided country or default
        poc_name: name,
        poc_email: email.toLowerCase().trim(),
        poc_title: 'Voting Representative',
        member_count: 1,
        status: status, // Set status based on email confirmation
      })
      .select()
      .single();

    if (memberError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating organization:', memberError);
      }
      return null;
    }

    // Create the member person entry
    const { data: personData, error: personError } = await supabase
      .from('member_persons')
      .insert({
        member_id: memberData.id,
        name: name,
        email: email.toLowerCase().trim(),
        title: 'Voting Representative',
        is_voting_rep: true,
        status: status, // Set status based on email confirmation
      })
      .select()
      .single();

    if (personError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating member person:', personError);
      }
      // Try to clean up the member if person creation fails
      try {
        await supabase.from('members').delete().eq('id', memberData.id);
      } catch (cleanupError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error cleaning up member after person creation failure:', cleanupError);
        }
      }
      // Return null to indicate failure, but don't throw - let caller handle gracefully
      return null;
    }

    // Link the user to the new organization
    const match: MemberMatch = {
      memberId: memberData.id,
      organizationName: memberData.organization_name,
      personId: personData.id,
      personName: personData.name,
      personTitle: personData.title || undefined,
      isVotingRep: personData.is_voting_rep || false,
    };

    await linkUserToMember(userId, match, roleFromSession);
    return match;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating organization for user:', error);
    }
    return null;
  }
}

/**
 * Check and link user on login/signup
 * This should be called after successful authentication
 * If no existing member is found and organization name is provided, creates a new organization
 * If a pending member is found, activates them (changes status to 'active')
 */
export async function autoLinkUserToMember(
  email: string,
  userId: string,
  existingRole?: string,
  organizationName?: string,
  userName?: string,
  countryName?: string
): Promise<MemberMatch | null> {
  try {
    const match = await findMemberByEmail(email);
    
    if (match) {
      // Check if email is confirmed
      const { data: { user } } = await supabase.auth.getUser();
      const isEmailConfirmed = user?.email_confirmed_at !== null;
      
      // Check if this is a pending member/organization
      const { data: memberData } = await supabase
        .from('members')
        .select('status, country')
        .eq('id', match.memberId)
        .single();

      // Check if person is pending
      const { data: personData } = await supabase
        .from('member_persons')
        .select('status')
        .eq('id', match.personId)
        .eq('email', email.toLowerCase().trim())
        .single();

      // If email is confirmed, activate pending members/persons
      if (isEmailConfirmed) {
        // Activate pending organization if needed
        if (memberData && memberData.status === 'pending') {
          const { error: updateError } = await supabase
            .from('members')
            .update({
              status: 'active',
              country: countryName || memberData.country || 'United States of America',
              poc_name: userName || match.personName,
              poc_title: 'Voting Representative',
            })
            .eq('id', match.memberId);

          if (updateError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error activating pending member:', updateError);
            }
          }
        }

        // Activate pending person if needed
        if (personData && personData.status === 'pending') {
          const { error: personUpdateError } = await supabase
            .from('member_persons')
            .update({
              status: 'active',
            })
            .eq('id', match.personId)
            .eq('email', email.toLowerCase().trim());

          if (personUpdateError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error activating pending person:', personUpdateError);
            }
          }
        }
      }
      // If email is NOT confirmed, ensure they remain pending (don't activate)

      await linkUserToMember(userId, match, existingRole);
      return match;
    }
    
    // If no match found and organization name is provided, create a new organization
    if (organizationName && userName) {
      const newMatch = await createOrganizationForUser(userId, email, userName, organizationName, countryName || 'United States of America');
      return newMatch;
    }
    
    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error auto-linking user:', error);
    }
    return null;
  }
}

