import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookOpen, Users, Award, Youtube, Loader2, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  language: string;
  videoUrl: string;
}

// Function to summarize text to fit in video cards
const summarizeText = (text: string, maxLength: number = 120): string => {
  if (text.length <= maxLength) return text;
  
  // Try to find a good breaking point
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

// Function to format duration from ISO 8601 format
const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 'Unknown';
  
  const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
  const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const Education: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        // YouTube video IDs from Travis Dougherty's channel
        const videoIds = [
          'WT_TIv1M96U',
          'RGns_KUhd3M', 
          '2Euof4PnjDk',
          'ros3INVOQEU',
          '7hSqaqOzvO8',
          'nNjmPO2X8to',
          'LZgZ4K3OL80',
          '2BH5vE4iimk',
          'E3IOrWXZXRg',
          'n2uRSQRpxPk',
          'YbeseYDCp_A',
          'fOBS5V8fowg',
          'MtCkG5_1mpA',
          'volVXtRKoWk',
          'uxBO2TQr4d8',
          'jkt-z3c5Ff4'
        ];

        // Function to fetch video info from YouTube
        const fetchVideoInfo = async (videoId: string) => {
          try {
            // Try multiple methods to get real video data
            let title = '';
            let description = '';
            
            // Method 1: Try oEmbed API (most reliable for titles)
            try {
              const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
              if (oembedResponse.ok) {
                const oembedData = await oembedResponse.json();
                title = oembedData.title;
                console.log(`Got title for ${videoId}: ${title}`);
              }
            } catch (e) {
              console.log(`oEmbed failed for ${videoId}:`, e);
            }
            
            // Method 2: Try alternative API endpoint
            if (!title) {
              try {
                const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
                if (response.ok) {
                  const data = await response.json();
                  title = data.title || '';
                  console.log(`Got title via noembed for ${videoId}: ${title}`);
                }
              } catch (e) {
                console.log(`noembed failed for ${videoId}:`, e);
              }
            }
            
            // Fallback descriptions based on known video content
            const fallbackDescriptions: { [key: string]: string } = {
              'WT_TIv1M96U': "Comprehensive overview of the 6-level classification system for sign language technologies, covering from basic recognition to native-like performance.",
              'RGns_KUhd3M': "Analysis of current sign language AI capabilities and emerging trends in the field of automated sign language recognition and generation.",
              '2Euof4PnjDk': "Exploring ethical frameworks and community involvement in AI development for sign language technologies.",
              'ros3INVOQEU': "Deep dive into the technical aspects of sign language recognition systems and the challenges faced in development.",
              '7hSqaqOzvO8': "Progression of avatar technology through the development stages, from basic sign generation to sophisticated native-like performance.",
              'nNjmPO2X8to': "Comprehensive evaluation methods and benchmarking approaches for assessing sign language AI systems.",
              'LZgZ4K3OL80': "The importance of Deaf community involvement in technology development and ensuring authentic representation.",
              '2BH5vE4iimk': "Vision for achieving native-like performance in sign language AI and the roadmap to get there.",
              'E3IOrWXZXRg': "Latest developments and research findings in sign language AI technology and recognition systems.",
              'n2uRSQRpxPk': "Advanced methods and techniques for improving sign language recognition accuracy and performance.",
              'YbeseYDCp_A': "Exploring the intersection of sign language technology and artificial intelligence, covering recent advancements and applications.",
              'fOBS5V8fowg': "Technical deep-dive into sign language recognition algorithms and their implementation in real-world systems.",
              'MtCkG5_1mpA': "Discussion on the future of sign language AI and emerging technologies that will shape the field.",
              'volVXtRKoWk': "Practical applications of sign language AI in educational and accessibility contexts.",
              'uxBO2TQr4d8': "Community perspectives on sign language technology development and user experience considerations.",
              'jkt-z3c5Ff4': "Research updates and breakthrough developments in sign language recognition and generation systems."
            };
            
            description = fallbackDescriptions[videoId] || "Video description unavailable";
            
            // Final fallback for title
            if (!title) {
              title = `Sign Language AI Video - ${videoId}`;
            }
            
            return {
              id: videoId,
              title: title,
              description: description,
              thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              duration: 'Unknown', // Duration requires YouTube API key
              language: 'American Sign Language',
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`
            };
          } catch (error) {
            console.error(`Error fetching info for video ${videoId}:`, error);
            // Fallback data
            return {
              id: videoId,
              title: `Video ${videoId}`,
              description: "Video information unavailable",
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: 'Unknown',
              language: 'American Sign Language',
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`
            };
          }
        };

        console.log('Fetching real video data from YouTube...');
        
        // Fetch all video data in parallel
        const videoPromises = videoIds.map(fetchVideoInfo);
        const realVideos = await Promise.all(videoPromises);
        
        console.log('Loading videos:', realVideos.length, 'videos found');
        console.log('Video titles:', realVideos.map(v => v.title));
        
        setVideos(realVideos);
        setLoading(false);
        console.log('Videos loaded successfully');
      } catch (error) {
        console.error('Error fetching video data:', error);
        setLoading(false);
      }
    };

    fetchVideoData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-electric-blue" />
              <p className="text-gray-600">Loading educational videos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      {/* Skip Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-electric-blue text-white px-4 py-2 rounded z-50">
        Skip to main content
      </a>

      <main id="main-content" className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Educational Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore comprehensive educational content on sign language AI technologies, 
            from basic concepts to advanced implementations.
          </p>
        </div>

        {/* Featured Videos Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Educational Videos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn from industry experts and researchers about the latest developments 
              in sign language AI technology.
            </p>
          </div>
          
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No videos found. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={`Thumbnail for ${video.title}`}
                      className="w-full aspect-video object-cover"
                      onError={(e) => {
                        console.log(`Thumbnail failed to load for video ${video.id}: ${video.thumbnail}`);
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        console.log(`Thumbnail loaded successfully for video ${video.id}`);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-electric-blue to-blue-600 flex items-center justify-center" style={{display: 'none'}}>
                      <Youtube className="h-12 w-12 text-white" aria-hidden="true" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="bg-black bg-opacity-70 rounded-full p-2">
                        <Youtube className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2 flex-grow">
                    <CardTitle className="text-base font-semibold line-clamp-2 leading-tight mb-2">
                      {summarizeText(video.title, 60)}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <span className="bg-electric-blue/10 text-electric-blue px-2 py-1 rounded text-xs font-medium">
                        {video.language}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {summarizeText(video.description, 120)}
                    </p>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 mt-auto">
                    <Button 
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
                      size="sm"
                    >
                      Watch Video
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Additional Resources Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Additional Learning Resources
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive collection of resources to deepen your understanding 
              of sign language AI technologies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Papers</h3>
              <p className="text-gray-600 mb-6">
                Access the latest research papers and academic publications on sign language 
                recognition and avatar technology.
              </p>
              <Button className="bg-gray-400 text-white cursor-not-allowed" disabled>
                Coming Soon
              </Button>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tutorial Series</h3>
              <p className="text-gray-600 mb-6">
                Step-by-step tutorials covering implementation details and best practices 
                for sign language AI development.
              </p>
              <Button className="bg-gray-400 text-white cursor-not-allowed" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-electric-blue to-blue-600 text-white p-12 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Dive Deeper?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community of learners and stay updated with the latest developments 
            in sign language AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/membership">
              <Button size="lg" variant="secondary" className="bg-white text-electric-blue hover:bg-gray-100">
                Join Community
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-electric-blue">
              Subscribe to Updates
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" role="contentinfo" aria-label="Footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/slxai-footer-logo.png" 
                alt="SLxAI: Sign Language AI Global Cooperative Logo" 
                className="h-8 w-auto mb-4"
              />
              <div className="h-8 mb-4 text-white font-bold text-lg" style={{display: 'none'}}>
                SLxAI
              </div>
              <p className="text-gray-400">
                Building the future of sign language AI through global cooperation and ethical standards.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Organization</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/membership" className="hover:text-white transition-colors">Membership</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Programs</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/summit" className="hover:text-white transition-colors">SLxAI Summit</Link></li>
                <li><Link to="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link></li>
                <li><Link to="/education" className="hover:text-white transition-colors">Education</Link></li>
                <li><Link to="/policy" className="hover:text-white transition-colors">Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <p className="text-gray-400 mb-2">Stay updated on our latest initiatives</p>
              <Button className="bg-electric-blue hover:bg-blue-600 text-white">
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SLxAI. All rights reserved. | A Global Cooperative Nonprofit</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Education;

