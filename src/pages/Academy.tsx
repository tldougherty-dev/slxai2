import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AcademyPublicLayout from '@/components/academy/AcademyPublicLayout';
import { GraduationCap, Users } from 'lucide-react';

export default function Academy() {
  return (
    <AcademyPublicLayout title="SLxAI Academy | Live AI Workshops in Sign Language">
      <section className="border-b border-slate-200 bg-gradient-to-b from-electric-blue/10 to-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-electric-blue/10 px-4 py-1.5 text-sm font-medium text-electric-blue">
            <GraduationCap className="h-4 w-4" aria-hidden />
            Live learning · Global community
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            SLxAI Academy
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            A global platform for live, interactive Zoom workshops in sign language that teach practical AI
            skills. Join real-time sessions on Zoom with presenters and peers. Ask questions, practice
            together, and build skills in a connected learning community.
          </p>
        </div>
      </section>

      <section className="bg-electric-blue px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="presenter-cta-heading">
        <div className="mx-auto max-w-3xl text-center text-white">
          <Users className="mx-auto mb-4 h-12 w-12" aria-hidden />
          <h2 id="presenter-cta-heading" className="mb-4 text-3xl font-bold">
            Become a Presenter
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/90">
            Share your AI expertise with a global deaf community. Propose a live Zoom workshop and our team
            will review your submission, then help you schedule, promote, and deliver your session.
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-electric-blue hover:bg-white/90">
            <Link to="/academy/submit">Submit a workshop proposal</Link>
          </Button>
        </div>
      </section>
    </AcademyPublicLayout>
  );
}
