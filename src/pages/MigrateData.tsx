// Migration page - one-click data migration to Supabase
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react';
import { migrateAllData } from '@/lib/supabase-migration';
import { useToast } from '@/hooks/use-toast';

export default function MigrateData() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [results, setResults] = useState<{
    members: boolean;
    votes: boolean;
    files: boolean;
    videos: boolean;
  } | null>(null);
  const { toast } = useToast();

  const handleMigrate = async () => {
    setIsMigrating(true);
    setResults(null);

    try {
      const migrationResults = await migrateAllData();
      setResults(migrationResults);

      const allSuccess = Object.values(migrationResults).every(r => r === true);

      if (allSuccess) {
        toast({
          title: "Migration Successful!",
          description: "All data has been migrated to Supabase.",
        });
      } else {
        toast({
          title: "Migration Partially Complete",
          description: "Some data was migrated. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: "Check console for error details.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-electric-blue" />
            Migrate Data to Supabase
          </CardTitle>
          <CardDescription>
            Move all your existing data (members, votes, files, videos) from local storage to Supabase database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What will be migrated:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>61 Member Organizations (with all individual members)</li>
              <li>All Votes (active and past, with vote options)</li>
              <li>All Files (with categories)</li>
              <li>All Videos</li>
            </ul>
          </div>

          <Button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="w-full bg-electric-blue hover:bg-blue-600"
            size="lg"
          >
            {isMigrating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Migrating Data...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Start Migration
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Migration Results:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 p-2 rounded ${results.members ? 'bg-green-50' : 'bg-red-50'}`}>
                  {results.members ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Members</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${results.votes ? 'bg-green-50' : 'bg-red-50'}`}>
                  {results.votes ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Votes</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${results.files ? 'bg-green-50' : 'bg-red-50'}`}>
                  {results.files ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Files</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${results.videos ? 'bg-green-50' : 'bg-red-50'}`}>
                  {results.videos ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Videos</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-1">After migration:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Data will be stored in Supabase (cloud database)</li>
              <li>You can view it in Supabase Dashboard → Table Editor</li>
              <li>Real-time updates will be enabled</li>
              <li>Your app will use Supabase instead of localStorage</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

