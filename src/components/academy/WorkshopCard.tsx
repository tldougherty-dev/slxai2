import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Languages, Users, Video } from 'lucide-react';
import type { AcademyWorkshop } from '@/data/academyTypes';
import { SKILL_LEVEL_LABELS } from '@/data/academyTypes';
import { format } from 'date-fns';

type WorkshopCardProps = {
  workshop: AcademyWorkshop;
  compact?: boolean;
};

export function WorkshopCard({ workshop, compact = false }: WorkshopCardProps) {
  const spotsLeft =
    workshop.maxParticipants != null && workshop.registrationCount != null
      ? Math.max(0, workshop.maxParticipants - workshop.registrationCount)
      : null;

  return (
    <Card className="flex h-full flex-col overflow-hidden border-slate-200 shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="bg-electric-blue px-4 py-3 text-white">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold leading-snug text-white sm:text-xl">
            {workshop.title}
          </CardTitle>
          {workshop.categoryName && (
            <Badge variant="secondary" className="shrink-0 bg-white/20 text-white hover:bg-white/30">
              {workshop.categoryName}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {!compact && (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{workshop.description}</p>
        )}

        <dl className="grid gap-2 text-sm text-slate-700">
          {workshop.scheduledAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
              <dd>{format(workshop.scheduledAt, 'EEEE, MMMM d, yyyy · h:mm a')} UTC</dd>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
            <dd>{workshop.durationMinutes} minutes · Live on Zoom</dd>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
            <dd>{workshop.signLanguage}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
            <dd>{SKILL_LEVEL_LABELS[workshop.skillLevel]}</dd>
          </div>
          {spotsLeft != null && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
              <dd>{spotsLeft} spots remaining</dd>
            </div>
          )}
        </dl>

        {workshop.aiTools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {workshop.aiTools.map((tool) => (
              <Badge key={tool} variant="outline" className="border-electric-blue/30 text-electric-blue">
                {tool}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <Button asChild className="w-full bg-electric-blue hover:bg-electric-blue/90">
            <Link to={`/academy/workshop/${workshop.slug}`}>View workshop & register</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
