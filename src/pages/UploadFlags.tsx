// One-time page to upload flags to Supabase Storage
// Access at /upload-flags (admin only)
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadFlag } from '@/lib/flagStorage';
import { isAdmin } from '@/lib/auth';
import { Navigate } from 'react-router-dom';

const FLAG_FILES = [
  'ar.svg',
  'australia.svg',
  'Austria.svg',
  'belgium.webp',
  'br.svg',
  'british-flag.svg',
  'ca.svg',
  'Flag_of_Australia.png',
  'Flag_of_India.svg',
  'Flag_of_Kenya.svg',
  'Flag_of_Niger.svg',
  'Flag_of_Nigeria.svg',
  'Flag_of_Pakistan.svg',
  'Flag_of_South_Africa.svg',
  'Flag_of_the_Netherlands.svg',
  'Flag_of_Turkey.svg',
  'flag-of-israel.webp',
  'fr.svg',
  'germany-flag.webp',
  'il.svg',
  'it.svg',
  'jp.svg',
  'no.svg',
  'nz.svg',
  'pl.svg',
  'rs.svg',
  'sweden.webp',
  'switzerland.webp',
  'us.svg',
  'usa.webp',
];

export default function UploadFlags() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: 'pending' | 'uploading' | 'success' | 'error' }>({});

  if (!isAdmin()) {
    return <Navigate to="/membership-portal" replace />;
  }

  const handleUploadAll = async () => {
    setUploading(true);
    const newProgress: typeof progress = {};

    for (const filename of FLAG_FILES) {
      try {
        newProgress[filename] = 'uploading';
        setProgress({ ...newProgress });

        // Fetch the local file
        const response = await fetch(`/flags/${filename}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${filename}`);
        }

        const blob = await response.blob();
        const file = new File([blob], filename, { type: blob.type });

        // Upload to Supabase Storage
        await uploadFlag(file, filename);

        newProgress[filename] = 'success';
        setProgress({ ...newProgress });
      } catch (error: any) {
        console.error(`Error uploading ${filename}:`, error);
        newProgress[filename] = 'error';
        setProgress({ ...newProgress });
      }
    }

    setUploading(false);
    toast({
      title: "Upload complete",
      description: "Flags have been uploaded to Supabase Storage.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Flags to Supabase Storage</CardTitle>
          <CardDescription>
            This will upload all flag images from local storage to Supabase Storage.
            Run this once after creating the 'flags' bucket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleUploadAll} 
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload All Flags'}
          </Button>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {FLAG_FILES.map(filename => (
              <div 
                key={filename} 
                className="flex items-center justify-between p-2 border rounded"
              >
                <span className="text-sm">{filename}</span>
                <span className="text-xs">
                  {progress[filename] === 'uploading' && '⏳ Uploading...'}
                  {progress[filename] === 'success' && '✅ Success'}
                  {progress[filename] === 'error' && '❌ Error'}
                  {!progress[filename] && '⏸️ Pending'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

