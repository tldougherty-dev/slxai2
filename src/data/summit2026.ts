import { supabase } from '@/lib/supabase';

export interface Presenter {
  name: string;
  email: string;
  bio?: string;
  organization?: string;
}

export interface WorkshopSubmission {
  id: string;
  title: string;
  description: string;
  submissionType: 'workshop' | 'panel';
  presenters: Presenter[];
  // Legacy fields for backward compatibility
  presenterName?: string;
  presenterEmail?: string;
  presenterBio?: string;
  presenterOrganization?: string;
  learningObjectives?: string;
  targetAudience?: string;
  durationMinutes?: number;
  maxParticipants?: number;
  technicalRequirements?: string;
  additionalInfo?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under_review';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SponsorSubmission {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyWebsite?: string;
  sponsorshipLevel?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'other';
  sponsorshipAmount?: number;
  sponsorshipPackageDetails?: string;
  companyDescription?: string;
  previousSponsorshipExperience?: string;
  marketingGoals?: string;
  additionalRequests?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under_review';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Workshop Submission Functions
export async function submitWorkshop(data: Omit<WorkshopSubmission, 'id' | 'status' | 'submittedAt' | 'createdAt' | 'updatedAt'>): Promise<WorkshopSubmission> {
  try {
    // Ensure user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    if (!session?.user) {
      throw new Error('User not authenticated. Please log in and try again.');
    }

    // Validate required fields
    if (!data.title || !data.description) {
      throw new Error('Title and description are required.');
    }
    if (!data.presenters || data.presenters.length === 0) {
      throw new Error('At least one presenter is required.');
    }

    // For backward compatibility, also set the first presenter as the primary presenter
    const firstPresenter = data.presenters && data.presenters.length > 0 ? data.presenters[0] : null;

    const { data: result, error } = await supabase
      .from('summit_workshop_submissions')
      .insert({
        title: data.title,
        description: data.description,
        submission_type: data.submissionType,
        // Pass the array directly - Supabase will convert it to JSONB
        presenters: data.presenters || [],
        presenter_name: firstPresenter?.name || data.presenterName || '',
        presenter_email: firstPresenter?.email || data.presenterEmail || '',
        presenter_bio: firstPresenter?.bio || data.presenterBio || null,
        presenter_organization: firstPresenter?.organization || data.presenterOrganization || null,
        learning_objectives: data.learningObjectives || null,
        target_audience: data.targetAudience || null,
        duration_minutes: data.durationMinutes || null,
        max_participants: data.maxParticipants || null,
        technical_requirements: data.technicalRequirements || null,
        additional_info: data.additionalInfo || null,
      })
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
        });
      }
      
      // Provide more specific error messages
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('denied')) {
        throw new Error(`Permission denied (RLS): ${error.message}. Code: ${error.code}. Please ensure you are logged in and run FIX_SUMMIT_2026_RLS_SIMPLE.sql in Supabase SQL Editor.`);
      } else if (error.code === '42P01') {
        throw new Error('Database error: The workshop submissions table does not exist. Please run SUMMIT_2026_SCHEMA.sql in Supabase SQL Editor.');
      } else {
        throw new Error(`Failed to submit workshop: ${error.message} (Code: ${error.code})`);
      }
    }

    // Parse presenters from JSONB
    let presenters: Presenter[] = [];
    if (result.presenters) {
      try {
        presenters = typeof result.presenters === 'string' 
          ? JSON.parse(result.presenters) 
          : result.presenters;
      } catch (e) {
        // Fallback to single presenter if parsing fails
        presenters = [{
          name: result.presenter_name || '',
          email: result.presenter_email || '',
          bio: result.presenter_bio,
          organization: result.presenter_organization,
        }];
      }
    } else {
      // Fallback for legacy data
      presenters = [{
        name: result.presenter_name || '',
        email: result.presenter_email || '',
        bio: result.presenter_bio,
        organization: result.presenter_organization,
      }];
    }

    return {
      id: result.id,
      title: result.title,
      description: result.description,
      submissionType: result.submission_type,
      presenters,
      presenterName: result.presenter_name,
      presenterEmail: result.presenter_email,
      presenterBio: result.presenter_bio,
      presenterOrganization: result.presenter_organization,
      learningObjectives: result.learning_objectives,
      targetAudience: result.target_audience,
      durationMinutes: result.duration_minutes,
      maxParticipants: result.max_participants,
      technicalRequirements: result.technical_requirements,
      additionalInfo: result.additional_info,
      status: result.status,
      submittedAt: new Date(result.submitted_at),
      reviewedAt: result.reviewed_at ? new Date(result.reviewed_at) : undefined,
      reviewedBy: result.reviewed_by,
      reviewNotes: result.review_notes,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error submitting workshop:', error);
    }
    throw error;
  }
}

export async function getWorkshopSubmissions(): Promise<WorkshopSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('summit_workshop_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => {
      // Parse presenters from JSONB
      let presenters: Presenter[] = [];
      if (row.presenters) {
        try {
          presenters = typeof row.presenters === 'string' 
            ? JSON.parse(row.presenters) 
            : row.presenters;
        } catch (e) {
          // Fallback to single presenter if parsing fails
          presenters = [{
            name: row.presenter_name || '',
            email: row.presenter_email || '',
            bio: row.presenter_bio,
            organization: row.presenter_organization,
          }];
        }
      } else {
        // Fallback for legacy data
        presenters = [{
          name: row.presenter_name || '',
          email: row.presenter_email || '',
          bio: row.presenter_bio,
          organization: row.presenter_organization,
        }];
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        submissionType: row.submission_type,
        presenters,
        presenterName: row.presenter_name,
        presenterEmail: row.presenter_email,
        presenterBio: row.presenter_bio,
        presenterOrganization: row.presenter_organization,
        learningObjectives: row.learning_objectives,
        targetAudience: row.target_audience,
        durationMinutes: row.duration_minutes,
        maxParticipants: row.max_participants,
        technicalRequirements: row.technical_requirements,
        additionalInfo: row.additional_info,
        status: row.status,
        submittedAt: new Date(row.submitted_at),
        reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
        reviewedBy: row.reviewed_by,
        reviewNotes: row.review_notes,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching workshop submissions:', error);
    }
    throw error;
  }
}

export async function updateWorkshopSubmissionStatus(
  id: string,
  status: WorkshopSubmission['status'],
  reviewNotes?: string
): Promise<void> {
  try {
    const user = await supabase.auth.getUser();
    const reviewedBy = user.data.user?.email || 'Unknown';

    const { error } = await supabase
      .from('summit_workshop_submissions')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
        review_notes: reviewNotes || null,
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating workshop submission:', error);
    }
    throw error;
  }
}

// Sponsor Submission Functions
export async function submitSponsor(data: Omit<SponsorSubmission, 'id' | 'status' | 'submittedAt' | 'createdAt' | 'updatedAt'>): Promise<SponsorSubmission> {
  try {
    // Validate required fields
    if (!data.companyName || !data.contactName || !data.contactEmail) {
      throw new Error('Company name, contact name, and contact email are required.');
    }

    // Ensure user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    if (!session?.user) {
      throw new Error('User not authenticated. Please log in and try again.');
    }

    const { data: result, error } = await supabase
      .from('summit_sponsor_submissions')
      .insert({
        company_name: data.companyName,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone || null,
        company_website: data.companyWebsite || null,
        sponsorship_level: data.sponsorshipLevel || null,
        sponsorship_amount: data.sponsorshipAmount || null,
        sponsorship_package_details: data.sponsorshipPackageDetails || null,
        company_description: data.companyDescription || null,
        previous_sponsorship_experience: data.previousSponsorshipExperience || null,
        marketing_goals: data.marketingGoals || null,
        additional_requests: data.additionalRequests || null,
      })
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
      }
      
      // Provide more specific error messages
      if (error.code === '42501') {
        throw new Error('Permission denied: You may not have permission to submit sponsorships. Please ensure you are logged in.');
      } else if (error.code === '42P01') {
        throw new Error('Database error: The sponsor submissions table does not exist. Please run SUMMIT_2026_SCHEMA.sql in Supabase SQL Editor.');
      } else {
        throw new Error(`Failed to submit sponsorship: ${error.message} (Code: ${error.code})`);
      }
    }

    return {
      id: result.id,
      companyName: result.company_name,
      contactName: result.contact_name,
      contactEmail: result.contact_email,
      contactPhone: result.contact_phone,
      companyWebsite: result.company_website,
      sponsorshipLevel: result.sponsorship_level,
      sponsorshipAmount: result.sponsorship_amount,
      sponsorshipPackageDetails: result.sponsorship_package_details,
      companyDescription: result.company_description,
      previousSponsorshipExperience: result.previous_sponsorship_experience,
      marketingGoals: result.marketing_goals,
      additionalRequests: result.additional_requests,
      status: result.status,
      submittedAt: new Date(result.submitted_at),
      reviewedAt: result.reviewed_at ? new Date(result.reviewed_at) : undefined,
      reviewedBy: result.reviewed_by,
      reviewNotes: result.review_notes,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error submitting sponsor:', error);
    }
    throw error;
  }
}

export async function getSponsorSubmissions(): Promise<SponsorSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('summit_sponsor_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      companyName: row.company_name,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      companyWebsite: row.company_website,
      sponsorshipLevel: row.sponsorship_level,
      sponsorshipAmount: row.sponsorship_amount,
      sponsorshipPackageDetails: row.sponsorship_package_details,
      companyDescription: row.company_description,
      previousSponsorshipExperience: row.previous_sponsorship_experience,
      marketingGoals: row.marketing_goals,
      additionalRequests: row.additional_requests,
      status: row.status,
      submittedAt: new Date(row.submitted_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.review_notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching sponsor submissions:', error);
    }
    throw error;
  }
}

export async function updateSponsorSubmissionStatus(
  id: string,
  status: SponsorSubmission['status'],
  reviewNotes?: string
): Promise<void> {
  try {
    const user = await supabase.auth.getUser();
    const reviewedBy = user.data.user?.email || 'Unknown';

    const { error } = await supabase
      .from('summit_sponsor_submissions')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
        review_notes: reviewNotes || null,
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating sponsor submission:', error);
    }
    throw error;
  }
}

export async function deleteWorkshopSubmission(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('summit_workshop_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting workshop submission:', error);
    }
    throw error;
  }
}

export async function deleteSponsorSubmission(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('summit_sponsor_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting sponsor submission:', error);
    }
    throw error;
  }
}

// Ticket Reservation Interfaces and Functions
export interface TicketReservation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  status: 'reserved' | 'confirmed' | 'cancelled';
  reservedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MAX_TICKETS = 175;

export async function submitTicketReservation(
  data: Omit<TicketReservation, 'id' | 'status' | 'reservedAt' | 'createdAt' | 'updatedAt' | 'confirmedAt' | 'cancelledAt'>
): Promise<TicketReservation> {
  try {
    // Validate required fields
    if (!data.name || !data.email) {
      throw new Error('Name and email are required.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format.');
    }

    // Check availability before inserting
    const availableCount = await getAvailableTicketCount();
    if (availableCount <= 0) {
      throw new Error('Sorry, all tickets have been reserved. Please check back later.');
    }

    // Try to insert - let the unique constraint handle duplicate emails
    // Note: We don't use .select() like interest_submissions - just insert without reading back
    const { error } = await supabase
      .from('summit_ticket_reservations')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        organization: data.organization || null,
        status: 'reserved',
      });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
      }

      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
        throw new Error('You already have a ticket reservation with this email address.');
      } else if (error.code === '42501') {
        throw new Error('Permission denied: Please run FIX_TICKET_RESERVATIONS_COMPLETE.sql in Supabase SQL Editor to fix permissions.');
      } else if (error.code === '42P01') {
        throw new Error('Database error: The ticket reservations table does not exist. Please run SUMMIT_TICKET_RESERVATIONS_SCHEMA.sql in Supabase SQL Editor.');
      } else {
        throw new Error(`Failed to submit reservation: ${error.message} (Code: ${error.code})`);
      }
    }

    // Return a success response without reading back the inserted data
    // This matches the pattern used by interest_submissions
    return {
      id: 'temp-id',
      name: data.name,
      email: data.email,
      phone: data.phone,
      organization: data.organization,
      status: 'reserved' as const,
      reservedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error submitting ticket reservation:', error);
    }
    throw error;
  }
}

export async function getAvailableTicketCount(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_available_ticket_count');

    if (error) {
      // If function doesn't exist or fails, return 0 to be safe
      // Note: Fallback direct SELECT won't work for anonymous users due to RLS
      // The function should always exist if FIX_TICKET_RESERVATIONS_COMPLETE.sql was run
      if (process.env.NODE_ENV === 'development') {
        console.warn('get_available_ticket_count RPC function failed:', error);
      }
      return 0;
    }

    return data || 0;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting available ticket count:', error);
    }
    // Return 0 on error to be safe
    return 0;
  }
}

export async function getReservedTicketCount(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_reserved_ticket_count');

    if (error) {
      // If function doesn't exist or fails, return 0 to be safe
      // Note: Fallback direct SELECT won't work for anonymous users due to RLS
      // The function should always exist if FIX_TICKET_RESERVATIONS_COMPLETE.sql was run
      if (process.env.NODE_ENV === 'development') {
        console.warn('get_reserved_ticket_count RPC function failed:', error);
      }
      return 0;
    }

    return data || 0;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting reserved ticket count:', error);
    }
    return 0;
  }
}

export async function getUserReservation(email: string): Promise<TicketReservation | null> {
  try {
    const { data, error } = await supabase
      .from('summit_ticket_reservations')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      organization: data.organization,
      status: data.status,
      reservedAt: new Date(data.reserved_at),
      confirmedAt: data.confirmed_at ? new Date(data.confirmed_at) : undefined,
      cancelledAt: data.cancelled_at ? new Date(data.cancelled_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting user reservation:', error);
    }
    throw error;
  }
}

