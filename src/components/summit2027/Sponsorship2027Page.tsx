import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ADD_ON_OPPORTUNITIES,
  AUDIENCE_CATEGORIES,
  CONTACT_EMAIL,
  DIFFERENTIATORS,
  EXHIBIT_LEVELS,
  FAQ_ITEMS,
  SPONSORSHIP_TIERS,
  WHY_SPONSOR_POINTS,
} from '@/components/summit2027/summit2027SponsorshipData';
import {
  ArrowRight,
  Building2,
  Check,
  Globe2,
  Eye,
  Handshake,
  Landmark,
  Mail,
  Megaphone,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const mailto = (subject: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

export function Sponsorship2027Page() {
  return (
    <main id="main-content" className="!bg-white bg-white text-slate-900">
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white"
        aria-labelledby="sponsor-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,128,255,0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(148,163,184,0.2), transparent)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            SLxAI Summit 2027
          </p>
          <h1
            id="sponsor-hero-heading"
            className="text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.15]"
          >
            Sponsor the Future of Sign Language and AI
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-slate-300 sm:text-lg">
            Support the leading summit bringing together sign language researchers, AI companies, accessibility
            leaders, universities, and Deaf community voices to shape the future of ethical and effective sign
            language technology.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg bg-electric-blue px-8 text-base font-semibold text-white shadow-lg shadow-electric-blue/25 transition hover:bg-electric-blue/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href="#sponsor-contact">Become a Sponsor</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-slate-500 bg-white/5 text-white backdrop-blur hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href={mailto('Sponsorship prospectus request')}>Download Sponsorship Prospectus</a>
            </Button>
          </div>
          <p className="mt-8 text-center text-sm text-slate-400">
            For sponsorship inquiries, contact{' '}
            <a
              className="font-medium text-electric-blue underline-offset-2 hover:text-sky-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>

      {/* Why sponsor */}
      <section className="border-b border-slate-100 bg-slate-50/90 py-16 sm:py-20" aria-labelledby="why-sponsor-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="why-sponsor-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why sponsor SLxAI?
            </h2>
            <p className="mt-3 text-slate-600">
              A focused audience, credible programming, and alignment with inclusive innovation.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_SPONSOR_POINTS.map((item, i) => {
              const WhyIcon = [Target, Users, Shield, Megaphone, Handshake, Eye][i] ?? Megaphone;
              return (
              <li key={item.title}>
                <Card className="h-full border-slate-200/80 bg-white shadow-sm transition hover:border-electric-blue/30 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <WhyIcon className="h-5 w-5" aria-hidden />
                    </div>
                    <CardTitle className="text-lg leading-snug text-slate-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed text-slate-600">{item.body}</CardDescription>
                  </CardContent>
                </Card>
              </li>
            );
            })}
          </ul>
        </div>
      </section>

      {/* Audience */}
      <section className="py-16 sm:py-20" aria-labelledby="audience-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="audience-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Who You Will Reach
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            This is a curated audience of builders, researchers, implementers, and community leaders—not general
            conference traffic. Expect depth, relevance, and decision-oriented conversations.
          </p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCE_CATEGORIES.map((label) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-electric-blue/25 hover:shadow-md"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Users className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm font-medium leading-snug text-slate-800">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tiers */}
      <section
        className="border-y border-slate-100 bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20"
        aria-labelledby="tiers-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="tiers-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sponsorship tiers
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Compare packages and choose the level of visibility and engagement that fits your organization.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {SPONSORSHIP_TIERS.map((tier) => (
              <article
                key={tier.id}
                className={`flex flex-col rounded-2xl border bg-white shadow-sm transition hover:shadow-lg ${
                  tier.featured
                    ? 'border-amber-400/60 ring-2 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {tier.featured ? (
                  <p className="rounded-t-2xl bg-gradient-to-r from-amber-500/90 to-amber-600/90 py-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
                    Premier package
                  </p>
                ) : null}
                <div className="flex flex-1 flex-col p-6 pt-6">
                  <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{tier.price}</p>
                  <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-600">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-8 w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2"
                  >
                    <a href={mailto(`Inquiry: ${tier.name}`)}>Discuss this tier</a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 sm:py-20" aria-labelledby="addons-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="addons-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Additional Sponsorship Opportunities
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Layer targeted visibility across receptions, meals, materials, and on-site amenities. Custom packages are
            available on request.
          </p>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Additional sponsorship opportunities and prices</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-900 sm:px-6">
                    Opportunity
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-900 sm:px-6">
                    Investment
                  </th>
                </tr>
              </thead>
              <tbody>
                {ADD_ON_OPPORTUNITIES.map((row, i) => (
                  <tr
                    key={row.name}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  >
                    <td className="px-4 py-3.5 text-slate-800 sm:px-6">{row.name}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-900 sm:px-6">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Exhibit */}
      <section className="border-t border-slate-100 bg-slate-50/80 py-16 sm:py-20" aria-labelledby="exhibit-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="exhibit-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Exhibit Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            Exhibit space puts your team in direct conversation with summit attendees in a focused environment—ideal for
            demos, discovery calls, and relationship building alongside plenary content.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {EXHIBIT_LEVELS.map((ex) => (
              <Card
                key={ex.name}
                className="border-slate-200 bg-white shadow-sm transition hover:border-electric-blue/30 hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">{ex.name}</CardTitle>
                  <p className="text-2xl font-bold text-slate-900">{ex.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {ex.benefits.map((b) => (
                      <li key={b} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why different */}
      <section className="py-16 sm:py-20" aria-labelledby="different-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="different-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why SLxAI Is Different
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {DIFFERENTIATORS.map((d, i) => {
              const icons = [Globe2, Landmark, Shield, Sparkles];
              const Icon = icons[i % icons.length];
              return (
                <div
                  key={d.title}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{d.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 bg-slate-50/90 py-16 sm:py-20" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-10 w-full rounded-xl border border-slate-200 bg-white px-4 shadow-sm sm:px-6">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={item.q}>
                <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="sponsor-contact"
        className="border-t border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 py-16 text-white sm:py-20"
        aria-labelledby="final-cta-heading"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Building2 className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
          <h2 id="final-cta-heading" className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Interested in Sponsoring SLxAI?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            We would be glad to discuss sponsorship options, exhibit opportunities, and custom partnership packages.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg bg-electric-blue px-8 font-semibold text-white shadow-lg shadow-electric-blue/20 hover:bg-electric-blue/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" aria-hidden />
                Contact Us
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-slate-500 bg-transparent text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href={mailto('Request sponsorship deck')} className="inline-flex items-center justify-center gap-2">
                Request Sponsorship Deck
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-electric-blue underline-offset-2 hover:text-sky-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
