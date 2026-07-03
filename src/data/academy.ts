import { supabase } from '@/lib/supabase';
import {
  ACADEMY_CATEGORIES,
  ACADEMY_PRESENTERS,
  ACADEMY_WORKSHOPS,
} from './academySeed';
import type {
  AcademyAnalytics,
  AcademyCategory,
  AcademyEmailLog,
  AcademyPresenter,
  AcademyRegistration,
  AcademyResource,
  AcademySubmission,
  AcademyWorkshop,
  EmailType,
  RegisterWorkshopInput,
  SkillLevel,
  SubmissionStatus,
  SubmitProposalInput,
  WorkshopStatus,
} from './academyTypes';

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  return error?.code === '42P01' || Boolean(error?.message?.includes('does not exist'));
}

function mapCategory(row: Record<string, unknown>): AcademyCategory {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: row.description as string,
    icon: row.icon as string | undefined,
    displayOrder: (row.display_order as number) ?? 0,
  };
}

function mapPresenter(row: Record<string, unknown>): AcademyPresenter {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    bio: row.bio as string,
    organization: row.organization as string | undefined,
    email: row.email as string,
    signLanguage: row.sign_language as string,
    avatarUrl: row.avatar_url as string | undefined,
    featured: Boolean(row.featured),
  };
}

function mapResource(row: Record<string, unknown>): AcademyResource {
  return {
    id: row.id as string,
    workshopId: row.workshop_id as string,
    title: row.title as string,
    url: row.url as string,
    fileType: row.file_type as string | undefined,
    displayOrder: (row.display_order as number) ?? 0,
  };
}

function mapWorkshop(
  row: Record<string, unknown>,
  presenter?: AcademyPresenter,
  category?: AcademyCategory,
  resources?: AcademyResource[],
  registrationCount?: number,
): AcademyWorkshop {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string,
    categoryId: row.category_id as string,
    categorySlug: category?.slug,
    categoryName: category?.name,
    skillLevel: row.skill_level as SkillLevel,
    aiTools: (row.ai_tools as string[]) ?? [],
    signLanguage: row.sign_language as string,
    durationMinutes: row.duration_minutes as number,
    learningObjectives: (row.learning_objectives as string[]) ?? [],
    presenterId: row.presenter_id as string,
    presenter,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at as string) : undefined,
    zoomUrl: row.zoom_url as string | undefined,
    zoomMeetingId: row.zoom_meeting_id as string | undefined,
    zoomPasscode: row.zoom_passcode as string | undefined,
    status: row.status as WorkshopStatus,
    maxParticipants: row.max_participants as number | undefined,
    registrationCount,
    resources,
    recordingUrl: row.recording_url as string | undefined,
  };
}

function mapSubmission(row: Record<string, unknown>): AcademySubmission {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    skillLevel: row.skill_level as SkillLevel,
    aiTools: (row.ai_tools as string[]) ?? [],
    signLanguage: row.sign_language as string,
    durationMinutes: row.duration_minutes as number,
    presenterName: row.presenter_name as string,
    presenterBio: row.presenter_bio as string,
    presenterOrganization: row.presenter_organization as string | undefined,
    contactName: row.contact_name as string,
    contactEmail: row.contact_email as string,
    contactPhone: row.contact_phone as string | undefined,
    status: row.status as SubmissionStatus,
    submittedAt: new Date(row.submitted_at as string),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string) : undefined,
    reviewedBy: row.reviewed_by as string | undefined,
    reviewNotes: row.review_notes as string | undefined,
  };
}

function mapRegistration(row: Record<string, unknown>, workshopTitle?: string): AcademyRegistration {
  return {
    id: row.id as string,
    workshopId: row.workshop_id as string,
    workshopTitle,
    name: row.name as string,
    email: row.email as string,
    organization: row.organization as string | undefined,
    registeredAt: new Date(row.registered_at as string),
  };
}

function mapEmailLog(row: Record<string, unknown>): AcademyEmailLog {
  return {
    id: row.id as string,
    workshopId: row.workshop_id as string | undefined,
    recipientEmail: row.recipient_email as string,
    subject: row.subject as string,
    emailType: row.email_type as EmailType,
    sentAt: new Date(row.sent_at as string),
    status: row.status as AcademyEmailLog['status'],
  };
}

export async function getCategories(): Promise<AcademyCategory[]> {
  const { data, error } = await supabase
    .from('academy_categories')
    .select('*')
    .order('display_order');

  if (error) {
    if (isMissingTableError(error)) return [...ACADEMY_CATEGORIES].sort((a, b) => a.displayOrder - b.displayOrder);
    throw error;
  }
  if (!data?.length) return [...ACADEMY_CATEGORIES].sort((a, b) => a.displayOrder - b.displayOrder);
  return data.map(mapCategory);
}

export async function getFeaturedPresenters(): Promise<AcademyPresenter[]> {
  const { data, error } = await supabase
    .from('academy_presenters')
    .select('*')
    .eq('featured', true)
    .order('name');

  if (error) {
    if (isMissingTableError(error)) return ACADEMY_PRESENTERS.filter((p) => p.featured);
    throw error;
  }
  if (!data?.length) return ACADEMY_PRESENTERS.filter((p) => p.featured);
  return data.map(mapPresenter);
}

export async function getAllPresenters(): Promise<AcademyPresenter[]> {
  const { data, error } = await supabase.from('academy_presenters').select('*').order('name');
  if (error) {
    if (isMissingTableError(error)) return ACADEMY_PRESENTERS;
    throw error;
  }
  if (!data?.length) return ACADEMY_PRESENTERS;
  return data.map(mapPresenter);
}

export async function getUpcomingWorkshops(): Promise<AcademyWorkshop[]> {
  const workshops = await getWorkshops({ status: 'scheduled' });
  const now = Date.now();
  return workshops
    .filter((w) => !w.scheduledAt || w.scheduledAt.getTime() >= now - 24 * 60 * 60 * 1000)
    .sort((a, b) => (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0));
}

export async function getWorkshops(options?: { status?: WorkshopStatus }): Promise<AcademyWorkshop[]> {
  let query = supabase.from('academy_workshops').select('*').order('scheduled_at', { ascending: true });
  if (options?.status) query = query.eq('status', options.status);

  const { data, error } = await query;
  if (error) {
    if (isMissingTableError(error)) {
      let seed = [...ACADEMY_WORKSHOPS];
      if (options?.status) seed = seed.filter((w) => w.status === options.status);
      return seed;
    }
    throw error;
  }
  if (!data?.length) {
    let seed = [...ACADEMY_WORKSHOPS];
    if (options?.status) seed = seed.filter((w) => w.status === options.status);
    return seed;
  }

  const [presenters, categories] = await Promise.all([getAllPresenters(), getCategories()]);
  const presenterMap = new Map(presenters.map((p) => [p.id, p]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const workshopIds = data.map((row) => row.id as string);
  const { data: resources } = await supabase
    .from('academy_workshop_resources')
    .select('*')
    .in('workshop_id', workshopIds)
    .order('display_order');

  const { data: regCounts } = await supabase.from('academy_registrations').select('workshop_id');
  const countMap = new Map<string, number>();
  regCounts?.forEach((r) => {
    const id = r.workshop_id as string;
    countMap.set(id, (countMap.get(id) ?? 0) + 1);
  });

  const resourcesByWorkshop = new Map<string, AcademyResource[]>();
  resources?.forEach((r) => {
    const mapped = mapResource(r);
    const list = resourcesByWorkshop.get(mapped.workshopId) ?? [];
    list.push(mapped);
    resourcesByWorkshop.set(mapped.workshopId, list);
  });

  return data.map((row) => {
    const category = categoryMap.get(row.category_id as string);
    const presenter = presenterMap.get(row.presenter_id as string);
    return mapWorkshop(
      row,
      presenter,
      category,
      resourcesByWorkshop.get(row.id as string),
      countMap.get(row.id as string),
    );
  });
}

export async function getWorkshopBySlug(slug: string): Promise<AcademyWorkshop | null> {
  const { data, error } = await supabase.from('academy_workshops').select('*').eq('slug', slug).maybeSingle();
  if (error) {
    if (isMissingTableError(error)) return ACADEMY_WORKSHOPS.find((w) => w.slug === slug) ?? null;
    throw error;
  }
  if (!data) return ACADEMY_WORKSHOPS.find((w) => w.slug === slug) ?? null;

  const [presenters, categories] = await Promise.all([getAllPresenters(), getCategories()]);
  const presenter = presenters.find((p) => p.id === data.presenter_id);
  const category = categories.find((c) => c.id === data.category_id);

  const { data: resources } = await supabase
    .from('academy_workshop_resources')
    .select('*')
    .eq('workshop_id', data.id)
    .order('display_order');

  const { count } = await supabase
    .from('academy_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('workshop_id', data.id);

  return mapWorkshop(
    data,
    presenter,
    category,
    resources?.map(mapResource),
    count ?? 0,
  );
}

export async function submitProposal(input: SubmitProposalInput): Promise<AcademySubmission> {
  const { data, error } = await supabase
    .from('academy_workshop_submissions')
    .insert({
      title: input.title,
      description: input.description,
      skill_level: input.skillLevel ?? 'all_levels',
      ai_tools: input.aiTools,
      sign_language: input.signLanguage,
      duration_minutes: input.durationMinutes,
      presenter_name: input.presenterName,
      presenter_bio: input.presenterBio,
      presenter_organization: input.presenterOrganization ?? null,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone ?? null,
    })
    .select()
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return {
        id: `local-${Date.now()}`,
        ...input,
        skillLevel: input.skillLevel ?? 'all_levels',
        status: 'pending',
        submittedAt: new Date(),
      };
    }
    throw new Error(error.message);
  }
  return mapSubmission(data);
}

export async function registerForWorkshop(input: RegisterWorkshopInput): Promise<AcademyRegistration> {
  const { data, error } = await supabase
    .from('academy_registrations')
    .insert({
      workshop_id: input.workshopId,
      name: input.name,
      email: input.email,
      organization: input.organization ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('You are already registered for this workshop.');
    if (isMissingTableError(error)) {
      return {
        id: `local-${Date.now()}`,
        workshopId: input.workshopId,
        name: input.name,
        email: input.email,
        organization: input.organization,
        registeredAt: new Date(),
      };
    }
    throw new Error(error.message);
  }

  await logEmail({
    workshopId: input.workshopId,
    recipientEmail: input.email,
    subject: 'Workshop registration confirmed',
    emailType: 'registration_confirmation',
  });

  return mapRegistration(data);
}

async function logEmail(input: {
  workshopId?: string;
  recipientEmail: string;
  subject: string;
  emailType: EmailType;
}): Promise<void> {
  await supabase.from('academy_email_logs').insert({
    workshop_id: input.workshopId ?? null,
    recipient_email: input.recipientEmail,
    subject: input.subject,
    email_type: input.emailType,
    status: 'sent',
  });
}

// Admin functions
export async function getSubmissions(): Promise<AcademySubmission[]> {
  const { data, error } = await supabase
    .from('academy_workshop_submissions')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return (data ?? []).map(mapSubmission);
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  reviewNotes?: string,
  reviewedBy?: string,
): Promise<void> {
  const { error } = await supabase
    .from('academy_workshop_submissions')
    .update({
      status,
      review_notes: reviewNotes ?? null,
      reviewed_by: reviewedBy ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getRegistrations(): Promise<AcademyRegistration[]> {
  const { data, error } = await supabase
    .from('academy_registrations')
    .select('*, academy_workshops(title)')
    .order('registered_at', { ascending: false });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return (data ?? []).map((row) =>
    mapRegistration(row, (row.academy_workshops as { title?: string } | null)?.title),
  );
}

export async function getEmailLogs(): Promise<AcademyEmailLog[]> {
  const { data, error } = await supabase
    .from('academy_email_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(100);
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return (data ?? []).map(mapEmailLog);
}

export async function getAcademyAnalytics(): Promise<AcademyAnalytics> {
  const [workshops, submissions, registrations, presenters] = await Promise.all([
    getWorkshops(),
    getSubmissions(),
    getRegistrations(),
    getFeaturedPresenters(),
  ]);

  const registrationsByWorkshop = workshops.map((w) => ({
    workshopId: w.id,
    title: w.title,
    count: w.registrationCount ?? registrations.filter((r) => r.workshopId === w.id).length,
  }));

  return {
    totalWorkshops: workshops.length,
    scheduledWorkshops: workshops.filter((w) => w.status === 'scheduled').length,
    totalRegistrations: registrations.length,
    pendingSubmissions: submissions.filter((s) => s.status === 'pending').length,
    featuredPresenters: presenters.length,
    registrationsByWorkshop,
  };
}

export async function updateWorkshopSchedule(
  id: string,
  updates: {
    scheduledAt?: string;
    zoomUrl?: string;
    zoomMeetingId?: string;
    zoomPasscode?: string;
    status?: WorkshopStatus;
    maxParticipants?: number;
  },
): Promise<void> {
  const { error } = await supabase
    .from('academy_workshops')
    .update({
      scheduled_at: updates.scheduledAt ?? null,
      zoom_url: updates.zoomUrl ?? null,
      zoom_meeting_id: updates.zoomMeetingId ?? null,
      zoom_passcode: updates.zoomPasscode ?? null,
      status: updates.status,
      max_participants: updates.maxParticipants ?? null,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function approveSubmissionAsWorkshop(
  submission: AcademySubmission,
  slug: string,
  categoryId: string,
): Promise<void> {
  const { data: presenter, error: presenterError } = await supabase
    .from('academy_presenters')
    .insert({
      slug: slug + '-presenter',
      name: submission.presenterName,
      bio: submission.presenterBio,
      organization: submission.presenterOrganization ?? null,
      email: submission.contactEmail,
      sign_language: submission.signLanguage,
      featured: false,
    })
    .select()
    .single();

  if (presenterError) throw new Error(presenterError.message);

  const { error: workshopError } = await supabase.from('academy_workshops').insert({
    slug,
    title: submission.title,
    description: submission.description,
    category_id: categoryId,
    presenter_id: presenter.id,
    submission_id: submission.id,
    skill_level: submission.skillLevel,
    ai_tools: submission.aiTools,
    sign_language: submission.signLanguage,
    duration_minutes: submission.durationMinutes,
    learning_objectives: [],
    status: 'draft',
  });

  if (workshopError) throw new Error(workshopError.message);

  await updateSubmissionStatus(submission.id, 'approved');
}

export async function sendReminderEmail(
  workshopId: string,
  recipientEmail: string,
  subject: string,
): Promise<void> {
  await logEmail({
    workshopId,
    recipientEmail,
    subject,
    emailType: 'reminder',
  });
}
