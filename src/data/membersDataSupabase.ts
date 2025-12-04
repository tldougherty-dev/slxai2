// Supabase-based member data management
// This replaces the localStorage-based membersData.ts

import { supabase } from '@/lib/supabase';
import { Member, MemberPerson } from './members';

// Convert Supabase row to Member format
function supabaseRowToMember(row: any, persons: any[]): Member {
  // Filter out empty social media values
  let socialMedia = undefined;
  
  // Debug: Log raw data from database
  if (process.env.NODE_ENV === 'development') {
    console.log('supabaseRowToMember - raw row.social_media:', row.social_media);
    console.log('supabaseRowToMember - type:', typeof row.social_media);
  }
  
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
  
  // Debug: Log processed social media
  if (process.env.NODE_ENV === 'development') {
    console.log('supabaseRowToMember - processed socialMedia:', socialMedia);
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
    members: persons.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      title: p.title || undefined,
      isVotingRep: p.is_voting_rep || false,
    })),
  };
}

// Get all members from Supabase
export async function getAllMembers(): Promise<Member[]> {
  try {
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('organization_name');

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return [];
    }

    if (!membersData || membersData.length === 0) {
      return [];
    }

    // Fetch all member persons
    const { data: personsData, error: personsError } = await supabase
      .from('member_persons')
      .select('*');

    if (personsError) {
      console.error('Error fetching member persons:', personsError);
    }

    // Group persons by member_id
    const personsByMember = new Map<string, any[]>();
    if (personsData) {
      personsData.forEach(person => {
        if (!personsByMember.has(person.member_id)) {
          personsByMember.set(person.member_id, []);
        }
        personsByMember.get(person.member_id)!.push(person);
      });
    }

    // Combine members with their persons
    return membersData.map(member => 
      supabaseRowToMember(member, personsByMember.get(member.id) || [])
    );
  } catch (error) {
    console.error('Error in getAllMembers:', error);
    return [];
  }
}

// Get member by ID
export async function getMemberById(id: string): Promise<Member | undefined> {
  try {
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (memberError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('getMemberById - error:', memberError);
      }
      return undefined;
    }

    if (!memberData) {
      return undefined;
    }

    // Debug: Log raw data from database
    if (process.env.NODE_ENV === 'development') {
      console.log('getMemberById - raw memberData.social_media:', memberData.social_media);
      console.log('getMemberById - raw memberData.social_media type:', typeof memberData.social_media);
    }

    // Fetch persons for this member
    const { data: personsData } = await supabase
      .from('member_persons')
      .select('*')
      .eq('member_id', id);

    const result = supabaseRowToMember(memberData, personsData || []);
    
    // Debug: Log final result
    if (process.env.NODE_ENV === 'development') {
      console.log('getMemberById - final result.socialMedia:', result.socialMedia);
    }
    
    return result;
  } catch (error) {
    console.error('Error in getMemberById:', error);
    return undefined;
  }
}

// Add a new member
export async function addMember(member: Member): Promise<void> {
  try {
    // Insert member
    const { data: memberData, error: memberError } = await supabase
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
      })
      .select()
      .single();

    if (memberError) {
      throw memberError;
    }

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

      if (personsError) {
        throw personsError;
      }
    }
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
}

// Update a member
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
    // Filter out empty social media values before saving
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
        console.log('updateMember - saving social_media:', updateData.social_media);
      }
    }
    if (updates.pocName !== undefined) updateData.poc_name = updates.pocName;
    if (updates.pocEmail !== undefined) updateData.poc_email = updates.pocEmail;
    if (updates.pocTitle !== undefined) updateData.poc_title = updates.pocTitle;
    if (updates.memberCount !== undefined) updateData.member_count = updates.memberCount;

    // Debug: Log update data before sending
    if (process.env.NODE_ENV === 'development') {
      console.log('updateMember - updateData being sent:', JSON.stringify(updateData, null, 2));
    }

    const { error, data } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', memberId)
      .select();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('updateMember - error:', error);
      }
      throw error;
    }

    // Debug: Log response from database
    if (process.env.NODE_ENV === 'development') {
      console.log('updateMember - response data:', data);
      if (data && data.length > 0) {
        console.log('updateMember - saved social_media:', data[0].social_media);
        console.log('updateMember - saved social_media type:', typeof data[0].social_media);
      }
    }

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
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
}

// Delete a member
export async function deleteMember(memberId: string): Promise<void> {
  try {
    // Delete member (cascade will delete persons)
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

