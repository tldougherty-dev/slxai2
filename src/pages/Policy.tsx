import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Globe, Shield, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Policy = () => {
  const policyAreas = [
    {
      icon: <Shield className="h-8 w-8" aria-hidden="true" />,
      title: "AI Ethics & Rights",
      description: "Advocating for ethical AI development that respects Deaf culture and linguistic rights"
    },
    {
      icon: <Users className="h-8 w-8" aria-hidden="true" />,
      title: "Community Representation",
      description: "Ensuring Deaf communities have meaningful participation in AI development processes"
    },
    {
      icon: <Globe className="h-8 w-8" aria-hidden="true" />,
      title: "Accessibility Standards",
      description: "Promoting universal design principles in sign language AI technologies"
    },
    {
      icon: <FileText className="h-8 w-8" aria-hidden="true" />,
      title: "Data Privacy",
      description: "Protecting sign language data and ensuring transparent, consensual use"
    }
  ];

  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="text-electric-blue">Policy</span> & Advocacy
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Shaping global policy for ethical sign language AI development through research, 
            advocacy, and collaboration with international organizations.
          </p>
        </div>
      </section>

      {/* Policy Areas */}
      <section className="py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Policy Focus Areas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We work across multiple policy domains to ensure sign language AI serves 
              the needs and rights of Deaf communities worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {policyAreas.map((area, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-electric-blue">
                <CardHeader>
                  <div className="text-electric-blue mb-4 flex justify-center">
                    {area.icon}
                  </div>
                  <CardTitle className="text-lg">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{area.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Position Statements */}
      <section className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Position Statements</h2>
            <p className="text-xl text-gray-600">
              Our official positions on key issues in sign language AI development
            </p>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Deaf Community Leadership in AI Development
              </h3>
              <p className="text-gray-600">
                SLxAI firmly believes that Deaf communities must be at the center of sign language AI development. 
                No technology should be developed "for" Deaf people without meaningful participation and leadership 
                from Deaf individuals throughout the entire process—from conception to deployment.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Data Sovereignty and Sign Language Corpora
              </h3>
              <p className="text-gray-600">
                Sign language data represents cultural and linguistic heritage. We advocate for clear protocols 
                regarding data collection, storage, and use, ensuring that Deaf communities maintain sovereignty 
                over their linguistic data and benefit from its use in AI development.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Cultural Authenticity in AI Avatars
              </h3>
              <p className="text-gray-600">
                AI avatars and sign language generation systems must respect the cultural and linguistic nuances 
                of sign languages. We oppose the commodification of sign languages and advocate for authentic 
                representation that honors the richness and diversity of sign language communities.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Contact Info */}
            <div>
              <img 
                src="/slxai-footer-logo.png" 
                alt="SLxAI: Sign Language AI Global Cooperative Logo" 
                className="h-8 w-auto mb-4"
              />
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@slxai.org</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Global Network</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="hover:text-electric-blue transition-colors">About Us</a></li>
                <li><a href="/education" className="hover:text-electric-blue transition-colors">Education</a></li>
                <li><a href="/benchmarks" className="hover:text-electric-blue transition-colors">Benchmarks</a></li>
                <li><a href="/contact" className="hover:text-electric-blue transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="/summit" className="hover:text-electric-blue transition-colors">Summit</a></li>
                <li><a href="/membership" className="hover:text-electric-blue transition-colors">Membership</a></li>
                <li><a href="/policy" className="hover:text-electric-blue transition-colors">Policy</a></li>
              </ul>
            </div>

            {/* External Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">External Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://wfdeaf.org" target="_blank" rel="noopener noreferrer" className="hover:text-electric-blue transition-colors flex items-center">
                    World Federation of the Deaf
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://un.org/disabilities" target="_blank" rel="noopener noreferrer" className="hover:text-electric-blue transition-colors flex items-center">
                    UN Disability Rights
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Sign Language AI Nexus. All rights reserved. | 
              <a href="#" className="hover:text-electric-blue transition-colors ml-2">Privacy Policy</a> | 
              <a href="#" className="hover:text-electric-blue transition-colors ml-2">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Policy;
