import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Eye, ArrowUp, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const About = () => {
  const boardMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Board Chair",
      bio: "Deaf researcher specializing in AI ethics and sign language technology",
      placeholder: true
    },
    {
      name: "Prof. Michael Chen",
      role: "Technical Director",
      bio: "Computer vision expert with 15 years in sign language recognition",
      placeholder: true
    },
    {
      name: "Maria Rodriguez",
      role: "Community Liaison",
      bio: "Deaf advocate and entrepreneur in accessible technology",
      placeholder: true
    },
    {
      name: "Dr. James Wilson",
      role: "Research Coordinator",
      bio: "AI researcher focused on ethical technology development",
      placeholder: true
    }
  ];

  return (
    <div className="min-h-screen" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-electric-blue py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            About <span className="text-blue-200">SLxAI</span>
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            We are a global cooperative nonprofit uniting companies, researchers, and Deaf-led innovators 
            to shape the future of sign language AI technologies through ethical standards and community collaboration.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Goals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-electric-blue">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-2xl font-bold text-gray-900">Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  To establish ethical standards, foster innovation, and ensure accessibility in 
                  sign language AI technologies through global cooperation and Deaf community leadership.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-electric-blue">
              <CardHeader className="text-center">
                <Eye className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-2xl font-bold text-gray-900">Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  A world where sign language AI technologies are developed ethically, 
                  accessible to all, and truly representative of Deaf communities worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-electric-blue">
              <CardHeader className="text-center">
                <ArrowUp className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-gray-900">Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2">
                  <li>• Develop industry-standard benchmarks</li>
                  <li>• Foster ethical AI development</li>
                  <li>• Provide educational resources</li>
                  <li>• Advocate for inclusive policies</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* This Can Be You Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">This Can Be You!</h2>
            <p className="text-xl text-gray-600">
              Join our community of innovators, researchers, and advocates working to build 
              ethical sign language AI technologies. Be part of shaping the future.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Be Part of History</h3>
              <p className="text-gray-600 mb-6">
                Join us as we launch the first global cooperative dedicated to ethical sign language AI development.
              </p>
              <Link to="/membership">
                <Button className="bg-electric-blue hover:bg-blue-600 text-white">
                  Apply for Membership
                </Button>
              </Link>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Shape the Future</h3>
              <p className="text-gray-600 mb-6">
                Help establish standards, influence policy, and create technologies that truly serve Deaf communities.
              </p>
              <Link to="/membership">
                <Button className="bg-electric-blue hover:bg-blue-600 text-white">
                  Join Our Mission
                </Button>
              </Link>
            </Card>
          </div>

          {/* Example Companies */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Leading Companies Already Interested</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              <Card className="p-6 text-center border-l-4 border-l-electric-blue">
                <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">GoSign.ai</span>
                </div>
              </Card>

              <Card className="p-6 text-center border-l-4 border-l-electric-blue">
                <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Migam.ai</span>
                </div>
              </Card>

              <Card className="p-6 text-center border-l-4 border-l-electric-blue">
                <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Omnibridge</span>
                </div>
              </Card>

              <Card className="p-6 text-center border-l-4 border-l-electric-blue">
                <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Sign-Speak</span>
                </div>
              </Card>
            </div>
            <p className="text-gray-500 mt-6 text-sm">
              * These companies represent the type of innovative organizations we're looking to partner with
            </p>
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

export default About;
