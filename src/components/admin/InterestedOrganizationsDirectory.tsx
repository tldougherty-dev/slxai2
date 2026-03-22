import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { INTERESTED_ORGANIZATIONS, getFlagImageUrl } from '@/data/interestedOrganizations';

/**
 * Admin-only directory of organization names + flags (previously on the public homepage).
 */
export function InterestedOrganizationsDirectory() {
  return (
    <Card className="glass-card floating-hover">
      <CardHeader>
        <CardTitle>Interested organizations directory</CardTitle>
        <CardDescription>
          Names and flags that were listed under “Organization Members Interested” on the public site. Kept here for
          reference ({INTERESTED_ORGANIZATIONS.length} organizations). Public page still shows 250+ / 50+ counts only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 max-w-6xl mx-auto max-h-[min(70vh,720px)] overflow-y-auto pr-2 border border-gray-100 dark:border-gray-700 rounded-lg p-4">
          {INTERESTED_ORGANIZATIONS.map((company) => (
            <div key={company.name} className="flex items-start gap-2 py-1 text-sm">
              <img
                src={getFlagImageUrl(company.code)}
                alt=""
                className="h-4 w-auto flex-shrink-0 mt-0.5"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <span className="text-gray-900 dark:text-white">{company.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({company.country})</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4 italic">and many more members!</p>
      </CardContent>
    </Card>
  );
}
