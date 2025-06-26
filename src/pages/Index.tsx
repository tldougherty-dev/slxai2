import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { Calendar, Users, Award, BookOpen, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 animate-fade-in">
              <img 
                src="/lovable-uploads/0941509f-be4a-49e7-b472-735a4942f89a.png" 
                alt="SLxAI Logo" 
                className="h-48 w-auto mx-auto mb-6"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              <span className="block">Building the future of</span>
              <span className="block text-electric-blue">sign language and AI</span>
              <span className="block text-gray-900 text-6xl md:text-7xl font-extrabold mt-2">together.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              SLxAI is a global cooperative nonprofit creating standards, community, and advocacy around sign language AI technologies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/membership">
                <Button 
                  size="lg" 
                  className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Become a Member
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  size="lg" 
                  className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Summit 2026 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-electric-blue flex flex-col">
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 text-electric-blue mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex justify-center mb-2">
                  <img src="/slxai-footer-logo.png" alt="SLxAI Logo" className="h-8 w-auto" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Summit</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col">
                <p className="text-gray-600 mb-6">
                  Join researchers, companies, and Deaf-led innovators for our inaugural summit on sign language AI technologies.
                </p>
                <p className="text-sm text-gray-500 mb-4">Date & Location TBD</p>
                <div className="mt-auto">
                  <Link to="/summit">
                    <Button className="bg-electric-blue hover:bg-blue-600 text-white w-full">
                      RSVP Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Benchmarks */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-electric-blue flex flex-col">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-electric-blue mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                <CardTitle className="text-2xl font-bold text-gray-900">Benchmarks Launching Soon</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col">
                <p className="text-gray-600 mb-6">
                  Industry-standard grading system for AI avatars and Sign Language Recognition tools, ensuring quality and accessibility.
                </p>
                <div className="mt-auto">
                  <Link to="/benchmarks">
                    <Button className="bg-electric-blue hover:bg-blue-600 text-white w-full">
                      Learn About Standards
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-electric-blue flex flex-col">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-electric-blue mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                <CardTitle className="text-2xl font-bold text-gray-900">Educational Videos</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col">
                <p className="text-gray-600 mb-6">
                  AI literacy content in multiple sign languages: ASL, LSF, BSL, and more, created by and for Deaf communities.
                </p>
                <div className="mt-auto">
                  <Link to="/education">
                    <Button className="bg-electric-blue hover:bg-blue-600 text-white w-full">
                      Explore Content
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Membership CTA Section */}
      <section className="py-20 bg-gradient-to-r from-electric-blue to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Subscribe to Learn More of Our Latest Progress
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Stay updated on our initiatives, research, and developments in ethical sign language AI technologies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-electric-blue hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Subscribe to Newsletter
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-electric-blue px-8 py-3 text-lg font-semibold transition-all duration-300"
            >
              View Member Benefits
            </Button>
          </div>
        </div>
      </section>

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

export default Index;
