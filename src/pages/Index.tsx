import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import { Calendar, Users, Globe, BookOpen, ArrowUp, Target, Eye, Award, Star, CheckCircle, Mail, Phone, MapPin, ExternalLink, FileText } from 'lucide-react';

const Index = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // No header offset needed since there's no navigation bar
      const elementPosition = element.offsetTop;
      
      // Scroll to the element
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      // Reset scroll behavior after animation
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'auto';
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-gray-50 to-white py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 animate-fade-in">
              <img 
                src="/lovable-uploads/0941509f-be4a-49e7-b472-735a4942f89a.png" 
                alt="SLxAI Logo" 
                className="h-40 w-auto mx-auto mb-6"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              <span className="block mb-2">Uniting industry leaders to</span>
              <span className="block text-electric-blue mb-2">establish the future of</span>
              <span className="block text-gray-900 text-6xl md:text-7xl font-extrabold">sign language x AI.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Join us at the inaugural SLxAI Summit where we'll bring together the world's leading companies 
              to form a cooperative nonprofit that will shape the future of sign language x AI technologies.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
              About
              <img 
                src="/slxai-footer-logo.png" 
                alt="SLxAI Logo" 
                className="h-8 w-auto inline-block align-middle"
              />
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              We are bringing together the world's leading sign language x AI companies to establish 
              a cooperative nonprofit where each company will have a board seat, ensuring collaborative 
              decision-making and ethical development of sign language x AI technologies.
            </p>
          </div>

          {/* Mission, Vision, Goals */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-l-4 border-l-electric-blue">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-2xl font-bold text-gray-900">Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  To unite industry leaders through a cooperative nonprofit structure, establishing 
                  ethical standards and driving innovation in sign language x AI technologies through 
                  equal representation and collaborative decision-making.
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
                  A world where sign language x AI technologies are developed through industry-wide 
                  collaboration, with each company having an equal voice in shaping the future 
                  of accessible technology.
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
                  <li>• Establish cooperative nonprofit structure</li>
                  <li>• Create industry-wide ethical standards</li>
                  <li>• Foster collaborative innovation</li>
                  <li>• Ensure equal company representation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Summit Focus Section */}
          <div className="text-center mb-12">
          </div>
          
          {/* The grid of cards is now empty, so remove the entire grid div. */}

          {/* Cooperative Structure Details */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Cooperative Structure</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 text-center border-l-4 border-l-electric-blue">
                <Users className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Equal Representation</h4>
                <p className="text-gray-600 text-sm">
                  Each participating company will have one board seat, ensuring equal voice in decisions.
                </p>
              </Card>

              <Card className="p-6 text-center border-l-4 border-l-electric-blue">
                <Target className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Collaborative Decision-Making</h4>
                <p className="text-gray-600 text-sm">
                  All major decisions will be made through consensus among board members.
                </p>
              </Card>

              <Card className="p-6 text-center border-l-4 border-l-electric-blue">
                <Eye className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Transparent Governance</h4>
                <p className="text-gray-600 text-sm">
                  Open communication and transparent processes for all cooperative activities.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Summit Section */}
      <section id="summit" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-6xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
              <img 
                src="/slxai-footer-logo.png" 
                alt="SLxAI Logo" 
                className="h-14 w-auto inline-block align-middle"
              />
              Summit 2026
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The historic gathering where industry leaders will establish the cooperative nonprofit 
              that will shape the future of sign language x AI technologies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What to Expect</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Formal establishment of the cooperative nonprofit structure</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Creation of bylaws and governance framework</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Development of standardized benchmarks for avatar quality and SLR performance grading</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Interactive workshops on technical standards and best practices</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Roundtable discussions on accessibility, ethics, and industry challenges</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Networking and collaboration opportunities</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Technology demonstrations and showcase sessions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Panel discussions with industry experts and advocates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Working groups to establish technical specifications and interoperability standards</span>
                </li>
              </ul>
            </div>

            <Card className="p-8 bg-gradient-to-br from-electric-blue to-blue-600 text-white">
              <CardHeader className="text-center">
                <Calendar className="h-16 w-16 text-white mx-auto mb-4" />
                <CardTitle className="text-2xl">Summit Details</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Date</h4>
                    <p className="text-blue-100">To be announced</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <p className="text-blue-100">To be announced</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Format</h4>
                    <p className="text-blue-100">In-person only</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Capacity</h4>
                    <p className="text-blue-100">Open to professionals working in the field of sign language and AI technologies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Become a Founding Member</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join the inaugural group of companies that will establish the SLxAI cooperative nonprofit. 
              Each founding member receives one board seat, ensuring equal representation in shaping the future of sign language x AI technologies.
            </p>
          </div>

          {/* Founding Member Benefits */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Founding Member Benefits</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              As a founding member, your company will have a unique opportunity to shape the cooperative's structure and future direction.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center p-6 border-l-4 border-l-electric-blue">
                <Star className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Founding Status</h4>
                <p className="text-gray-600">
                  Be recognized as one of the original companies that established the cooperative.
                </p>
              </Card>

              <Card className="text-center p-6 border-l-4 border-l-electric-blue">
                <Award className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Board Representation</h4>
                <p className="text-gray-600">
                  Guaranteed board seat with equal voting rights on all cooperative decisions.
                </p>
              </Card>

              <Card className="text-center p-6 border-l-4 border-l-electric-blue">
                <Globe className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Industry Leadership</h4>
                <p className="text-gray-600">
                  Help establish industry standards and ethical guidelines for sign language x AI.
                </p>
              </Card>

              <Card className="text-center p-6 border-l-4 border-l-electric-blue">
                <BookOpen className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Benchmarking & Standardization</h4>
                <p className="text-gray-600">
                  Play a key role in establishing benchmarks and standards for avatar and sign language recognition (SLR) technologies, helping to guide the industry toward greater interoperability and quality.
                </p>
              </Card>

              <Card className="text-center p-6 border-l-4 border-l-electric-blue">
                <ArrowUp className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Early Access & Influence</h4>
                <p className="text-gray-600">
                  Gain early access to new research, datasets, and tools developed by the cooperative. Founding members can pilot and shape upcoming initiatives, ensuring your needs and feedback are prioritized in the development of industry resources.
                </p>
              </Card>

              <Card className="text-center p-6 border-l-4 border-l-electric-blue">
                <Users className="h-12 w-12 text-electric-blue mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Global Recognition & Networking</h4>
                <p className="text-gray-600">
                  Be publicly recognized as a founding leader in the sign language x AI community. Enjoy exclusive networking opportunities with other industry pioneers, researchers, and advocates at cooperative events and through ongoing collaborations.
                </p>
              </Card>
            </div>

            {/* Companies Already Interested */}
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Companies Already Interested</h3>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Leading companies in the sign language x AI space have already expressed interest in becoming founding members.
              </p>

              <div className="grid md:grid-cols-5 gap-6 mb-8">
                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    GS
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">GoSign.ai</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    MA
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Migam.ai</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    SS
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Sign-Speak</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    OB
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Omnibridge</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    DA
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">DeepSignAI</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    AW
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">AvocadoWeb Services</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    DI
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Dillo.ai</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    SV
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">SignaVision Solutions</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    SA
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">SignAvatar</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>

                <Card className="text-center p-4 border-l-4 border-l-green-500">
                  <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    360
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">360 Direct Access</h4>
                  <p className="text-sm text-gray-600">Interested</p>
                </Card>
              </div>

              <p className="text-gray-600 max-w-2xl mx-auto">
                Join these industry leaders and be part of the founding group that will establish the cooperative nonprofit.
              </p>
            </div>
          </div>

          {/* Founding Member Application */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Founding Member Application</CardTitle>
                <p className="text-gray-600">
                  Complete the form below to apply for founding member status
                </p>
              </CardHeader>
              <CardContent>
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLSdYLiovv551vZcQ7qkemKwRYweQXoMncXyicGnnBRbQFjb4ug/viewform?embedded=true" 
                  width="100%" 
                  height="980px" 
                  frameBorder="0" 
                  marginHeight={0} 
                  marginWidth={0}
                  title="SLxAI Founding Member Application"
                >
                  Loading…
                </iframe>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Summit CTA Section */}
      <section className="py-20 bg-gradient-to-r from-electric-blue to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Be Part of History: Join the Inaugural Summit
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            This is your opportunity to help establish the cooperative nonprofit that will 
            shape the future of sign language x AI technologies. Secure your company's board seat.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
