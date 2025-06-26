import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Award, Mail, Phone, MapPin as MapPinIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Summit = () => {
  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SLxAI <span className="text-electric-blue">Summit</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Join researchers, companies, and Deaf-led innovators for our inaugural summit on 
            sign language AI technologies, ethics, and accessibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold">
              Subscribe to Newsletter
            </Button>
            <Link to="/sponsorship">
              <Button size="lg" className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold">
                Become a Sponsor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-l-4 border-l-electric-blue">
              <CardHeader>
                <Calendar className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <CardTitle className="text-xl">When</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Date TBD</p>
                <p className="text-sm text-gray-500">Details Coming Soon</p>
              </CardContent>
            </Card>

            <Card className="text-center border-l-4 border-l-electric-blue">
              <CardHeader>
                <MapPin className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-xl">Where</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Location TBD</p>
                <p className="text-sm text-gray-500">In-person Event</p>
              </CardContent>
            </Card>

            <Card className="text-center border-l-4 border-l-electric-blue">
              <CardHeader>
                <Users className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-xl">Who</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">200+ Attendees</p>
                <p className="text-sm text-gray-500">Researchers, Companies, Advocates</p>
              </CardContent>
            </Card>
          </div>

          {/* Themes */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Summit Themes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ethical AI Development</h3>
                <p className="text-gray-600">Exploring frameworks for responsible sign language AI that prioritizes Deaf community needs and cultural preservation.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Technology Innovation</h3>
                <p className="text-gray-600">Latest advances in sign language recognition, avatar technology, and accessible communication tools.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Partnership</h3>
                <p className="text-gray-600">Building bridges between Deaf communities, researchers, and technology companies for meaningful collaboration.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Policy & Standards</h3>
                <p className="text-gray-600">Developing industry benchmarks and advocating for inclusive policies in AI development and deployment.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Past Events Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Looking Forward to Our First Summit
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The SLxAI Summit will be our inaugural event, bringing together the global community 
            for the first time to establish the foundation of ethical sign language AI development.
          </p>
          <Card className="max-w-2xl mx-auto p-8">
            <div className="text-6xl text-electric-blue mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Be Part of History</h3>
            <p className="text-gray-600 mb-6">
              Join us as we launch the first global summit dedicated to ethical sign language AI development.
            </p>
            <Link to="/membership">
              <Button className="bg-electric-blue hover:bg-blue-600 text-white">
                Become a Member
              </Button>
            </Link>
          </Card>
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
              <Link to="/membership">
                <Button className="bg-electric-blue hover:bg-blue-600 text-white">
                  Become a Member
                </Button>
              </Link>
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

export default Summit;
