// Mutable member data management - shared between Admin and other pages
import { Member, MemberPerson, members as initialMembers } from './members';
import { supabase } from '@/lib/supabase';

// Create a mutable copy of the members array (fallback)
let membersData: Member[] = [...initialMembers];

// Convert Supabase row to Member format
function supabaseRowToMember(row: any, persons: any[]): Member {
  // Handle social media - filter out empty values and handle JSONB
  let socialMedia = undefined;
  if (row.social_media) {
    // Handle JSONB which might be a string that needs parsing
    let socialMediaData = row.social_media;
    if (typeof socialMediaData === 'string') {
      try {
        socialMediaData = JSON.parse(socialMediaData);
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error parsing social_media JSON:', e);
        }
        socialMediaData = null;
      }
    }
    
    if (socialMediaData && typeof socialMediaData === 'object') {
      const filtered = Object.fromEntries(
        Object.entries(socialMediaData).filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '')
      );
      if (Object.keys(filtered).length > 0) {
        socialMedia = filtered;
      }
    }
  }
  
  return {
    id: row.id,
    organizationName: row.organization_name,
    country: row.country,
    logo: row.logo || undefined,
    bio: row.bio || undefined,
    website: row.website || undefined,
    socialMedia: socialMedia,
    pocName: row.poc_name,
    pocEmail: row.poc_email,
    pocTitle: row.poc_title || undefined,
    memberCount: row.member_count || 0,
    status: row.status || 'active', // Default to 'active' for backward compatibility
    members: persons.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      title: p.title || undefined,
      isVotingRep: p.is_voting_rep || false,
      role: p.role || undefined,
      isRegistered: p.is_registered !== undefined ? p.is_registered : true, // Default to true if not specified
      status: p.status || 'active', // Default to 'active' for backward compatibility
    })),
  };
}

// Get all members (from Supabase, fallback to local)
export async function getAllMembers(): Promise<Member[]> {
  try {
    const { data: supabaseMembers, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('organization_name');

    if (membersError) {
      console.warn('Supabase error, using fallback:', membersError.message);
      return [...membersData];
    }

    if (!supabaseMembers || supabaseMembers.length === 0) {
      console.warn('No Supabase data found, using fallback');
      return [...membersData];
    }

    // Fetch all member persons
    const { data: personsData } = await supabase
      .from('member_persons')
      .select('*');

    // Fetch roles and email confirmation status from auth.users using RPC function
    let roleMap = new Map<string, string>();
    let emailConfirmedMap = new Map<string, boolean>();
    if (personsData && personsData.length > 0) {
      try {
        const emails = personsData.map(p => p.email.toLowerCase());
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_roles', {
          user_emails: emails
        });

        if (!roleError && roleData) {
          roleData.forEach((row: { email: string; role: string; email_confirmed_at?: string | null }) => {
            roleMap.set(row.email.toLowerCase(), row.role || 'member');
            const isEmailConfirmed = row.email_confirmed_at !== null && row.email_confirmed_at !== undefined;
            emailConfirmedMap.set(row.email.toLowerCase(), isEmailConfirmed);
          });
        }
      } catch (error) {
        console.warn('Error fetching user roles, continuing without roles:', error);
      }
    }

    // Group persons by member_id and add roles, sync status based on email confirmation
    const personsByMember = new Map<string, any[]>();
    if (personsData) {
      personsData.forEach(person => {
        if (!personsByMember.has(person.member_id)) {
          personsByMember.set(person.member_id, []);
        }
        const email = person.email.toLowerCase();
        const isEmailConfirmed = emailConfirmedMap.get(email) ?? false;
        
        // If database status is already 'active', keep it active (don't override manually activated accounts)
        // Only sync TO active if emails are confirmed, but don't sync FROM active to pending
        let correctStatus = person.status || 'pending';
        if (person.status === 'active') {
          // Already active - keep it active
          correctStatus = 'active';
        } else {
          // Not active yet - sync based on email confirmation
          correctStatus = isEmailConfirmed ? 'active' : 'pending';
        }
        
        // Sync status if it doesn't match AND we're not overriding an active status
        // Only update if status field exists (check if person.status is defined)
        if (person.status !== undefined && person.status !== correctStatus && person.status !== 'active') {
          // Update in database (async, don't wait)
          supabase
            .from('member_persons')
            .update({ status: correctStatus })
            .eq('id', person.id)
            .then(() => {
              if (process.env.NODE_ENV === 'development') {
                console.log(`Synced person ${person.email} status to ${correctStatus}`);
              }
            })
            .catch((error: any) => {
              // Silently ignore if column doesn't exist (user needs to run migration)
              if (error?.code === '42703' || error?.message?.includes('column') || error?.message?.includes('does not exist')) {
                if (process.env.NODE_ENV === 'development') {
                  console.warn(`Status column not found. Please run ADD_MEMBER_PERSON_STATUS_FIELD.sql`);
                }
              } else if (process.env.NODE_ENV === 'development') {
                console.error(`Error syncing person ${person.email} status:`, error);
              }
            });
        }
        
        personsByMember.get(person.member_id)!.push({
          ...person,
          status: correctStatus, // Use correct status based on email confirmation or keep active
          role: roleMap.get(email) || 'member'
        });
      });
    }

    // Use database status directly - don't override based on email confirmation
    // The database status is the source of truth
    const membersWithSyncedStatus = supabaseMembers.map(member => {
      // Use the status from database directly - don't override
      return {
        ...member,
        status: member.status || 'pending' // Use database status, default to pending if null
      };
    });

    // Combine members with their persons
    return membersWithSyncedStatus.map(member => 
      supabaseRowToMember(member, personsByMember.get(member.id) || [])
    );
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching members from Supabase, using fallback:', error);
    }
    return [...membersData];
  }
}

// Check if a user (by email) is a voting representative
export async function isUserVotingRepresentative(email: string): Promise<boolean> {
  try {
    const { data: personData, error } = await supabase
      .from('member_persons')
      .select('is_voting_rep')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !personData) {
      return false;
    }

    return personData.is_voting_rep === true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking voting representative status:', error);
    }
    return false;
  }
}

// Get member by ID (from Supabase, fallback to local)
export async function getMemberById(id: string): Promise<Member | undefined> {
  try {
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (memberError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('getMemberById (membersData.ts) - error:', memberError);
      }
      // Fallback to local data
      return membersData.find(m => m.id === id);
    }

    if (!memberData) {
      return membersData.find(m => m.id === id);
    }

    // Debug: Log raw data from database
    if (process.env.NODE_ENV === 'development') {
      console.log('getMemberById (membersData.ts) - raw memberData.social_media:', memberData.social_media);
      console.log('getMemberById (membersData.ts) - raw memberData.social_media type:', typeof memberData.social_media);
    }

    // Fetch persons for this member
    const { data: personsData } = await supabase
      .from('member_persons')
      .select('*')
      .eq('member_id', id);

    // Fetch roles and email confirmation status from auth.users using RPC function
    let roleMap = new Map<string, string>();
    let emailConfirmedMap = new Map<string, boolean>();
    if (personsData && personsData.length > 0) {
      try {
        const emails = personsData.map(p => p.email.toLowerCase());
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_roles', {
          user_emails: emails
        });

        if (!roleError && roleData) {
          roleData.forEach((row: { email: string; role: string; email_confirmed_at?: string | null }) => {
            roleMap.set(row.email.toLowerCase(), row.role || 'member');
            const isEmailConfirmed = row.email_confirmed_at !== null && row.email_confirmed_at !== undefined;
            emailConfirmedMap.set(row.email.toLowerCase(), isEmailConfirmed);
          });
        }
      } catch (error) {
        console.warn('Error fetching user roles, continuing without roles:', error);
      }
    }

    // Map persons with roles and sync status
    const personsWithRoles = (personsData || []).map(p => {
      const email = p.email.toLowerCase();
      const isEmailConfirmed = emailConfirmedMap.get(email) ?? false;
      const correctStatus = isEmailConfirmed ? 'active' : 'pending';
      
      // Sync status if it doesn't match email confirmation
      // Only update if status field exists
      if (p.status !== undefined && p.status !== correctStatus) {
        supabase
          .from('member_persons')
          .update({ status: correctStatus })
          .eq('id', p.id)
          .then(() => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Synced person ${p.email} status to ${correctStatus}`);
            }
          })
          .catch((error: any) => {
            // Silently ignore if column doesn't exist (user needs to run migration)
            if (error?.code === '42703' || error?.message?.includes('column') || error?.message?.includes('does not exist')) {
              if (process.env.NODE_ENV === 'development') {
                console.warn(`Status column not found. Please run ADD_MEMBER_PERSON_STATUS_FIELD.sql`);
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.error(`Error syncing person ${p.email} status:`, error);
            }
          });
      }
      
      return {
        ...p,
        status: correctStatus,
        role: roleMap.get(email) || 'member'
      };
    });
    
    // Sync member organization status: active if ANY member person is active, pending if ALL are pending
    const hasAnyActiveMember = personsWithRoles.some((person: any) => {
      const email = person.email?.toLowerCase();
      return emailConfirmedMap.get(email) === true;
    });
    // Organization is active if at least one member has confirmed email
    const correctMemberStatus = hasAnyActiveMember ? 'active' : 'pending';
    
    if (memberData.status !== correctMemberStatus) {
      supabase
        .from('members')
        .update({ status: correctMemberStatus })
        .eq('id', memberData.id)
        .then(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Synced member ${memberData.organization_name} status to ${correctMemberStatus} (hasAnyActiveMember: ${hasAnyActiveMember})`);
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Error syncing member ${memberData.organization_name} status:`, error);
          }
        });
      
      memberData.status = correctMemberStatus;
    }

    const result = supabaseRowToMember(memberData, personsWithRoles);
    
    // Debug: Log final result
    if (process.env.NODE_ENV === 'development') {
      console.log('getMemberById (membersData.ts) - final result.socialMedia:', result.socialMedia);
    }
    
    return result;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching member from Supabase, using fallback:', error);
    }
    return membersData.find(m => m.id === id);
  }
}

// Add a new member (to Supabase)
export async function addMember(member: Member): Promise<void> {
  try {
    // Insert member
    const { error: memberError } = await supabase
      .from('members')
      .insert({
        id: member.id,
        organization_name: member.organizationName,
        country: member.country,
        logo: member.logo,
        bio: member.bio,
        website: member.website,
        poc_name: member.pocName,
        poc_email: member.pocEmail,
        poc_title: member.pocTitle,
        member_count: member.memberCount,
        status: member.status || 'active', // Default to 'active' if not specified
      });

    if (memberError) throw memberError;

    // Insert member persons
    if (member.members && member.members.length > 0) {
      const persons = member.members.map(person => ({
        member_id: member.id,
        name: person.name,
        email: person.email,
        title: person.title,
        is_voting_rep: person.isVotingRep || false,
      }));

      const { error: personsError } = await supabase
        .from('member_persons')
        .insert(persons);

      if (personsError) throw personsError;
    }

    // Also update local cache
    membersData.push(member);
  } catch (error) {
    console.error('Error adding member to Supabase:', error);
    // Fallback to local
    membersData.push(member);
    throw error;
  }
}

// Update a member (in Supabase)
export async function updateMember(memberId: string, updates: Partial<Member>, currentUser?: { id: string; email: string; role?: string }): Promise<void> {
  try {
    // Authorization check: If currentUser is provided, verify they can edit this organization
    if (currentUser) {
      // Get the organization to check membership
      const { data: orgData, error: orgError } = await supabase
        .from('members')
        .select('id')
        .eq('id', memberId)
        .single();

      if (orgError || !orgData) {
        throw new Error('Organization not found');
      }

      // Get members of this organization
      const { data: membersData, error: membersError } = await supabase
        .from('member_persons')
        .select('email')
        .eq('member_id', memberId);

      if (membersError) {
        throw membersError;
      }

      // Check if user is a member of this organization
      const isMember = membersData?.some(
        m => m.email.toLowerCase() === currentUser.email.toLowerCase()
      ) || false;

      // Allow if user is a member OR if user is admin/super_admin
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
      
      if (!isMember && !isAdmin) {
        throw new Error('Unauthorized: You can only edit your own organization');
      }
    }

    const updateData: any = {};
    
    if (updates.organizationName !== undefined) updateData.organization_name = updates.organizationName;
    if (updates.country !== undefined) updateData.country = updates.country;
    if (updates.logo !== undefined) updateData.logo = updates.logo;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.website !== undefined) updateData.website = updates.website;
    
    // Handle social media - filter out empty values before saving
    if (updates.socialMedia !== undefined) {
      if (updates.socialMedia && typeof updates.socialMedia === 'object' && Object.keys(updates.socialMedia).length > 0) {
        const filteredSocialMedia = Object.fromEntries(
          Object.entries(updates.socialMedia).filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '')
        );
        updateData.social_media = Object.keys(filteredSocialMedia).length > 0 ? filteredSocialMedia : null;
      } else {
        updateData.social_media = null;
      }
      
      // Debug: Log what we're saving
      if (process.env.NODE_ENV === 'development') {
        console.log('updateMember (membersData.ts) - saving social_media:', updateData.social_media);
      }
    }
    
    if (updates.pocName !== undefined) updateData.poc_name = updates.pocName;
    if (updates.pocEmail !== undefined) updateData.poc_email = updates.pocEmail;
    if (updates.pocTitle !== undefined) updateData.poc_title = updates.pocTitle;
    if (updates.memberCount !== undefined) updateData.member_count = updates.memberCount;

    // Debug: Log update data before sending
    if (process.env.NODE_ENV === 'development') {
      console.log('updateMember (membersData.ts) - updateData being sent:', JSON.stringify(updateData, null, 2));
    }

    const { error, data } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', memberId)
      .select();

    // Debug: Log response from database
    if (process.env.NODE_ENV === 'development') {
      if (data && data.length > 0) {
        console.log('updateMember (membersData.ts) - saved social_media:', data[0].social_media);
      }
    }

    if (error) throw error;

    // Update members if provided
    if (updates.members) {
      // Delete existing persons
      await supabase
        .from('member_persons')
        .delete()
        .eq('member_id', memberId);

      // Insert new persons
      if (updates.members.length > 0) {
        const persons = updates.members.map(person => ({
          member_id: memberId,
          name: person.name,
          email: person.email,
          title: person.title,
          is_voting_rep: person.isVotingRep || false,
        }));

        await supabase
          .from('member_persons')
          .insert(persons);
      }
    }

    // Also update local cache
    const index = membersData.findIndex(m => m.id === memberId);
    if (index !== -1) {
      membersData[index] = { ...membersData[index], ...updates };
    }
  } catch (error) {
    console.error('Error updating member in Supabase:', error);
    // Fallback to local
    const index = membersData.findIndex(m => m.id === memberId);
    if (index !== -1) {
      membersData[index] = { ...membersData[index], ...updates };
    }
    throw error;
  }
}

// Delete a member (from Supabase)
export async function deleteMember(memberId: string): Promise<void> {
  try {
    // First, handle summit_members references (set to NULL or delete)
    // Check if there are any summit_members referencing this organization
    const { data: summitMembers, error: summitCheckError } = await supabase
      .from('summit_members')
      .select('id')
      .eq('organization_id', memberId);

    if (!summitCheckError && summitMembers && summitMembers.length > 0) {
      // Update summit_members to remove organization reference
      const { error: summitUpdateError, data: summitUpdateData } = await supabase
        .from('summit_members')
        .update({ 
          organization_id: null,
          organization_name: null
        })
        .eq('organization_id', memberId)
        .select();

      if (summitUpdateError) {
        if (import.meta.env.DEV) {
          console.error('Error updating summit_members before delete:', summitUpdateError);
        }
        // If we can't update summit_members, we can't safely delete
        throw new Error(`Cannot delete organization: Failed to update summit_members references. The organization is still referenced in summit_members table. Error: ${summitUpdateError.message}`);
      }
    }

    // Now delete the member organization
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    // Also update local cache
    membersData = membersData.filter(m => m.id !== memberId);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error deleting member from Supabase:', error);
    }
    // Fallback to local
    membersData = membersData.filter(m => m.id !== memberId);
    throw error;
  }
}

// Update member person within an organization
export function updateMemberPerson(memberId: string, personId: string, updates: Partial<MemberPerson>): void {
  const member = membersData.find(m => m.id === memberId);
  if (member) {
    const personIndex = member.members.findIndex(p => p.id === personId);
    if (personIndex !== -1) {
      member.members[personIndex] = { ...member.members[personIndex], ...updates };
      // Update POC if this person is the voting rep
      if (updates.isVotingRep) {
        member.pocName = member.members[personIndex].name;
        member.pocEmail = member.members[personIndex].email;
        member.pocTitle = member.members[personIndex].title || 'Voting Representative';
      }
    }
  }
  // In production, this would persist to backend/database
}

// Add person to member organization
export function addPersonToMember(memberId: string, person: MemberPerson): void {
  const member = membersData.find(m => m.id === memberId);
  if (member) {
    member.members.push(person);
    member.memberCount = member.members.length;
  }
  // In production, this would persist to backend/database
}

// Remove person from member organization
export function removePersonFromMember(memberId: string, personId: string): void {
  const member = membersData.find(m => m.id === memberId);
  if (member && member.members.length > 1) {
    member.members = member.members.filter(p => p.id !== personId);
    member.memberCount = member.members.length;
    // If removed person was POC, update POC to first voting rep or first person
    if (member.pocEmail === member.members.find(p => p.id === personId)?.email) {
      const votingRep = member.members.find(p => p.isVotingRep);
      const newPOC = votingRep || member.members[0];
      if (newPOC) {
        member.pocName = newPOC.name;
        member.pocEmail = newPOC.email;
        member.pocTitle = newPOC.title || 'Voting Representative';
      }
    }
  }
  // In production, this would persist to backend/database
}

