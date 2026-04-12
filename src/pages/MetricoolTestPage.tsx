import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const METRICOOL_HASH = 'ac83e2d5ea5afb1178d6b5f3f3b451d5';
const BE_SCRIPT_SRC = 'https://tracker.metricool.com/resources/be.js';
const SCRIPT_ATTR = 'data-metricool-be';

function initMetricool() {
  window.beTracker?.t({ hash: METRICOOL_HASH });
}

/**
 * Private test route: loads Metricool `be.js` and initializes the tracker/embed with the configured hash.
 * Not linked in navigation — sign in and open `/test` directly.
 */
export default function MetricoolTestPage() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_ATTR}]`);
    if (existing) {
      initMetricool();
      return;
    }

    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = BE_SCRIPT_SRC;
    script.setAttribute(SCRIPT_ATTR, '1');
    const run = () => initMetricool();
    script.onreadystatechange = run;
    script.onload = run;
    head.appendChild(script);
  }, []);

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
              Authenticated-only page for experimenting with the Metricool embed. The script loads once per session;
              content may appear below when Metricool injects it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hash: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">{METRICOOL_HASH}</code>
            </p>
            <div
              id="metricool-test-root"
              className="min-h-[24rem] w-full rounded-lg border border-dashed border-gray-300 bg-white/80 p-4 dark:border-gray-600 dark:bg-gray-900/40"
            >
              {/* Metricool may inject widgets into the document; this box reserves space for manual testing */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
