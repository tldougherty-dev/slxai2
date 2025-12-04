// Votes management with Supabase
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { isUserVotingRepresentative } from '@/data/membersData';

export interface VoteOption {
  id: string;
  label: string;
  votes: number;
}

export interface Vote {
  id: string;
  title: string;
  description: string;
  organization: string;
  endTime: Date;
  options: VoteOption[];
  hasVoted?: boolean;
  status: 'active' | 'closed' | 'draft';
  createdAt: Date;
}

// Fallback data (used if Supabase fails)
const fallbackVotes: Vote[] = [];

// Helper: Convert Supabase row to Vote
function supabaseRowToVote(voteRow: any, options: any[]): Vote {
  return {
    id: voteRow.id,
    title: voteRow.title,
    description: voteRow.description,
    organization: voteRow.organization,
    endTime: new Date(voteRow.end_time),
    options: options.map(opt => ({
      id: opt.id,
      label: opt.label,
      votes: opt.votes || 0,
    })),
    status: voteRow.status,
    createdAt: new Date(voteRow.created_at),
  };
}

// Get all votes
export async function getAllVotes(): Promise<Vote[]> {
  try {
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (votesError) throw votesError;
    if (!votes || votes.length === 0) return [...fallbackVotes];

    // Get all vote options
    const voteIds = votes.map(v => v.id);
    const { data: options, error: optionsError } = await supabase
      .from('vote_options')
      .select('*')
      .in('vote_id', voteIds);

    if (optionsError) throw optionsError;

    // Group options by vote_id
    const optionsByVoteId = new Map<string, any[]>();
    (options || []).forEach(opt => {
      if (!optionsByVoteId.has(opt.vote_id)) {
        optionsByVoteId.set(opt.vote_id, []);
      }
      optionsByVoteId.get(opt.vote_id)!.push(opt);
    });

    // Combine votes with their options
    return votes.map(vote => 
      supabaseRowToVote(vote, optionsByVoteId.get(vote.id) || [])
    );
  } catch (error) {
    console.error('Error fetching votes from Supabase:', error);
    return [...fallbackVotes];
  }
}

// Get active votes
export async function getActiveVotes(): Promise<Vote[]> {
  const allVotes = await getAllVotes();
  const now = new Date();
  return allVotes.filter(v => {
    if (v.status !== 'active') return false;
    // Auto-close expired votes
    if (now > v.endTime) {
      updateVote(v.id, { status: 'closed' }).catch(console.error);
      return false;
    }
    return true;
  });
}

// Get closed/past votes
export async function getPastVotes(): Promise<Vote[]> {
  const allVotes = await getAllVotes();
  return allVotes.filter(v => v.status === 'closed');
}

// Get vote by ID
export async function getVoteById(id: string): Promise<Vote | undefined> {
  try {
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .select('*')
      .eq('id', id)
      .single();

    if (voteError) throw voteError;
    if (!vote) return undefined;

    const { data: options, error: optionsError } = await supabase
      .from('vote_options')
      .select('*')
      .eq('vote_id', id);

    if (optionsError) throw optionsError;

    return supabaseRowToVote(vote, options || []);
  } catch (error) {
    console.error('Error fetching vote from Supabase:', error);
    return undefined;
  }
}

// Add a new vote
export async function addVote(vote: Vote): Promise<void> {
  try {
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

    if (voteError) throw voteError;

    // Insert vote options
    if (vote.options && vote.options.length > 0) {
      const optionsToInsert = vote.options.map(opt => ({
        id: opt.id,
        vote_id: voteData.id,
        label: opt.label,
        votes: opt.votes || 0,
      }));

      const { error: optionsError } = await supabase
        .from('vote_options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;
    }
  } catch (error) {
    console.error('Error adding vote to Supabase:', error);
    throw error;
  }
}

// Update a vote
export async function updateVote(voteId: string, updates: Partial<Vote>): Promise<void> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.organization !== undefined) updateData.organization = updates.organization;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime.toISOString();
    if (updates.status !== undefined) updateData.status = updates.status;

    const { error: voteError } = await supabase
      .from('votes')
      .update(updateData)
      .eq('id', voteId);

    if (voteError) throw voteError;

    // Update options if provided
    if (updates.options) {
      // Delete existing options
      await supabase
        .from('vote_options')
        .delete()
        .eq('vote_id', voteId);

      // Insert new options
      const optionsToInsert = updates.options.map(opt => ({
        id: opt.id,
        vote_id: voteId,
        label: opt.label,
        votes: opt.votes || 0,
      }));

      const { error: optionsError } = await supabase
        .from('vote_options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;
    }
  } catch (error) {
    console.error('Error updating vote in Supabase:', error);
    throw error;
  }
}

// Delete a vote
export async function deleteVote(voteId: string): Promise<void> {
  try {
    // Options will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('id', voteId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting vote from Supabase:', error);
    throw error;
  }
}

// Cast a vote (increment vote count for an option)
export async function castVote(voteId: string, optionId: string, userId?: string): Promise<boolean> {
  try {
    const vote = await getVoteById(voteId);
    if (!vote) return false;
    
    // Check if vote is still active
    if (vote.status !== 'active') return false;
    
    // Check if voting period has ended
    if (new Date() > vote.endTime) {
      // Auto-close expired votes
      await updateVote(voteId, { status: 'closed' });
      return false;
    }
    
    // Check if user is a voting representative
    const currentUser = getCurrentUser();
    if (!currentUser?.email) {
      if (process.env.NODE_ENV === 'development') {
        console.error('User not authenticated');
      }
      return false;
    }
    
    const isVotingRep = await isUserVotingRepresentative(currentUser.email);
    if (!isVotingRep) {
      if (process.env.NODE_ENV === 'development') {
        console.error('User is not a voting representative');
      }
      return false;
    }
    
    // Find the option
    const option = vote.options.find(opt => opt.id === optionId);
    if (!option) return false;
    
    // Increment vote count in database
    const { error } = await supabase
      .from('vote_options')
      .update({ votes: (option.votes || 0) + 1 })
      .eq('id', optionId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error casting vote:', error);
    }
    return false;
  }
}

// Calculate vote result (passed/failed)
export function calculateVoteResult(vote: Vote): 'passed' | 'failed' {
  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
  if (totalVotes === 0) return 'failed';
  
  const yesVotes = vote.options.find(opt => opt.id === 'yes' || opt.label.toLowerCase().includes('yes') || opt.label.toLowerCase().includes('approve'))?.votes || 0;
  const noVotes = vote.options.find(opt => opt.id === 'no' || opt.label.toLowerCase().includes('no') || opt.label.toLowerCase().includes('reject'))?.votes || 0;
  
  // Simple majority: more yes than no
  return yesVotes > noVotes ? 'passed' : 'failed';
}
