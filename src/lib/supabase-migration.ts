// Migration script to move data from localStorage/mock data to Supabase
// Run this once to migrate your existing data

import { supabase } from './supabase';
import { members } from '@/data/members';
import { getAllVotes } from '@/data/votes';
import { getAllFiles } from '@/data/filesOrder';
import { getOrderedVideos } from '@/data/videosOrder';

export async function migrateMembersToSupabase() {
  console.log('Starting members migration...');
  
  try {
    for (const member of members) {
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
          created_at: new Date('2024-11-18').toISOString(),
        })
        .select()
        .single();

      if (memberError && !memberError.message.includes('duplicate')) {
        console.error(`Error inserting member ${member.organizationName}:`, memberError);
        continue;
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
          console.error(`Error inserting persons for ${member.organizationName}:`, personsError);
        }
      }
    }

    console.log('✅ Members migration completed!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

export async function migrateVotesToSupabase() {
  console.log('Starting votes migration...');
  
  try {
    const votes = getAllVotes();
    
    for (const vote of votes) {
      // Insert vote
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .insert({
          id: vote.id,
          title: vote.title,
          description: vote.description,
          organization: vote.organization,
          end_time: vote.endTime.toISOString(),
          status: vote.status,
          created_at: vote.createdAt.toISOString(),
        })
        .select()
        .single();

      if (voteError && !voteError.message.includes('duplicate')) {
        console.error(`Error inserting vote ${vote.title}:`, voteError);
        continue;
      }

      // Insert vote options
      if (vote.options && vote.options.length > 0) {
        const options = vote.options.map(option => ({
          vote_id: vote.id,
          label: option.label,
          votes: option.votes,
        }));

        const { error: optionsError } = await supabase
          .from('vote_options')
          .insert(options);

        if (optionsError) {
          console.error(`Error inserting options for ${vote.title}:`, optionsError);
        }
      }
    }

    console.log('✅ Votes migration completed!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

export async function migrateFilesToSupabase() {
  console.log('Starting files migration...');
  
  try {
    const files = getOrderedFiles();
    
    for (const file of files) {
      const { error } = await supabase
        .from('files')
        .insert({
          id: file.id,
          name: file.name,
          type: file.type,
          description: file.description,
          category_id: file.categoryId,
          file_url: file.url,
          uploaded_by: file.uploadedBy,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error(`Error inserting file ${file.name}:`, error);
      }
    }

    console.log('✅ Files migration completed!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

export async function migrateVideosToSupabase() {
  console.log('Starting videos migration...');
  
  try {
    const videos = getOrderedVideos();
    
    for (const video of videos) {
      const { error } = await supabase
        .from('videos')
        .insert({
          id: video.id,
          name: video.name,
          description: video.description,
          embed_url: video.embedUrl,
          uploaded_by: video.uploadedBy,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error(`Error inserting video ${video.name}:`, error);
      }
    }

    console.log('✅ Videos migration completed!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

export async function migrateAllData() {
  console.log('🚀 Starting full data migration to Supabase...');
  
  const results = {
    members: false,
    votes: false,
    files: false,
    videos: false,
  };

  results.members = await migrateMembersToSupabase();
  results.votes = await migrateVotesToSupabase();
  results.files = await migrateFilesToSupabase();
  results.videos = await migrateVideosToSupabase();

  console.log('📊 Migration Results:', results);
  
  const allSuccess = Object.values(results).every(r => r === true);
  
  if (allSuccess) {
    console.log('🎉 All data migrated successfully!');
  } else {
    console.log('⚠️ Some migrations had errors. Check console for details.');
  }

  return results;
}

