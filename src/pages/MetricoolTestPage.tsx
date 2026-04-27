import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Private test route retained for internal notes.
 * Metricool now loads on the public landing page footer in a hidden container.
 */
export default function MetricoolTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 px-4 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/membership-portal/feed" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to feed
            </Link>
          </Button>
        </div>

        <Card className="border-electric-blue/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Metricool test</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Metricool has been moved to the public landing page footer and is loaded in hidden mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              id="metricool-test-root"
              className="min-h-[24rem] w-full rounded-lg border border-dashed border-gray-300 bg-white/80 p-4 dark:border-gray-600 dark:bg-gray-900/40"
            >
              Metricool loader is no longer attached to this route.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
