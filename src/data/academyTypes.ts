export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'under_review';
export type WorkshopStatus = 'draft' | 'scheduled' | 'completed' | 'cancelled';
export type EmailType = 'registration_confirmation' | 'reminder' | 'custom';

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  all_levels: 'All Levels',
};

export interface AcademyCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  displayOrder: number;
}

export interface AcademyPresenter {
  id: string;
  slug: string;
  name: string;
  bio: string;
  organization?: string;
  email: string;
  signLanguage: string;
  avatarUrl?: string;
  featured: boolean;
}

export interface AcademyResource {
  id: string;
  workshopId: string;
  title: string;
  url: string;
  fileType?: string;
  displayOrder: number;
}

export interface AcademyWorkshop {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  skillLevel: SkillLevel;
  aiTools: string[];
  signLanguage: string;
  durationMinutes: number;
  learningObjectives: string[];
  presenterId: string;
  presenter?: AcademyPresenter;
  scheduledAt?: Date;
  zoomUrl?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  status: WorkshopStatus;
  maxParticipants?: number;
  registrationCount?: number;
  resources?: AcademyResource[];
  recordingUrl?: string;
}

export interface AcademySubmission {
  id: string;
  title: string;
  description: string;
  skillLevel: SkillLevel;
  aiTools: string[];
  signLanguage: string;
  durationMinutes: number;
  presenterName: string;
  presenterBio: string;
  presenterOrganization?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: SubmissionStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface AcademyRegistration {
  id: string;
  workshopId: string;
  workshopTitle?: string;
  name: string;
  email: string;
  organization?: string;
  registeredAt: Date;
}

export interface AcademyEmailLog {
  id: string;
  workshopId?: string;
  recipientEmail: string;
  subject: string;
  emailType: EmailType;
  sentAt: Date;
  status: 'sent' | 'failed' | 'queued';
}

export interface SubmitProposalInput {
  title: string;
  description: string;
  skillLevel?: SkillLevel;
  aiTools: string[];
  signLanguage: string;
  durationMinutes: number;
  presenterName: string;
  presenterBio: string;
  presenterOrganization?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface RegisterWorkshopInput {
  workshopId: string;
  name: string;
  email: string;
  organization?: string;
}

export interface AcademyAnalytics {
  totalWorkshops: number;
  scheduledWorkshops: number;
  totalRegistrations: number;
  pendingSubmissions: number;
  featuredPresenters: number;
  registrationsByWorkshop: { workshopId: string; title: string; count: number }[];
}
