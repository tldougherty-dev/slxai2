import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import { Calendar, Users, Globe, BookOpen, ArrowUp, Target, Eye, Award, Star, CheckCircle, Mail, Phone, MapPin, ExternalLink, FileText } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    role: '',
    country: '',
    phone: '',
    experience: '',
    goals: '',
    newsletter: true,
    communications: true
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Founding member application submitted:', formData);
    alert('Thank you for your founding member application! We will contact you soon to discuss next steps.');
  };

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
              <span className="block text-gray-900 text-6xl md:text-7xl font-extrabold">sign language and AI.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Join us at the inaugural SLxAI Summit where we'll bring together the world's leading companies 
              to form a cooperative nonprofit that will shape the future of sign language and AI technologies.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              About <span className="text-electric-blue">SLxAI</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              We are bringing together the world's leading sign language and AI companies to establish 
              a cooperative nonprofit where each company will have a board seat, ensuring collaborative 
              decision-making and ethical development of sign language and AI technologies.
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
                  ethical standards and driving innovation in sign language and AI technologies through 
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
                  A world where sign language and AI technologies are developed through industry-wide 
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
            <h3 className="text-3xl font-bold text-gray-900 mb-4">The Inaugural Summit</h3>
            <p className="text-xl text-gray-600">
              The SLxAI Summit 2026 will be the historic gathering where industry leaders 
              come together to establish the cooperative nonprofit structure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <Calendar className="h-16 w-16 text-electric-blue mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Establish the Foundation</h3>
              <p className="text-gray-600 mb-6">
                At the summit, participating companies will formalize the cooperative structure, 
                establish bylaws, and create the framework for equal board representation.
              </p>
              <Button 
                className="bg-electric-blue hover:bg-blue-600 text-white"
                onClick={() => scrollToSection('summit')}
              >
                Join the Summit
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <Globe className="h-16 w-16 text-electric-blue mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Shape Industry Standards</h3>
              <p className="text-gray-600 mb-6">
                Together, we'll establish ethical guidelines, technical standards, and 
                collaborative frameworks that will guide the entire industry forward.
              </p>
              <Button 
                className="bg-electric-blue hover:bg-blue-600 text-white"
                onClick={() => scrollToSection('summit')}
              >
                Learn More
              </Button>
            </Card>
          </div>

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
            <h2 className="text-4xl font-bold text-gray-900 mb-6">SLxAI Summit 2026</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The historic gathering where industry leaders will establish the cooperative nonprofit 
              that will shape the future of sign language and AI technologies.
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
                  <span>Assignment of board seats to participating companies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Establishment of industry-wide ethical standards</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                  <span>Networking and collaboration opportunities</span>
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
                    <p className="text-blue-100">In-person with virtual options</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Capacity</h4>
                    <p className="text-blue-100">Limited to industry leaders</p>
                  </div>
                </div>
                <Button 
                  className="mt-6 bg-white text-electric-blue hover:bg-gray-100 w-full"
                  onClick={() => scrollToSection('membership')}
                >
                  Register Interest
                </Button>
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
              Each founding member receives one board seat, ensuring equal representation in shaping the future of sign language and AI.
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
                  Help establish industry standards and ethical guidelines for sign language and AI.
                </p>
              </Card>
            </div>

            {/* Companies Already Interested */}
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Companies Already Interested</h3>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Leading companies in the sign language and AI space have already expressed interest in becoming founding members.
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization *</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role/Title *</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience">Company Experience in Sign Language and AI</Label>
                    <Textarea
                      id="experience"
                      rows={4}
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Describe your company's experience and involvement in sign language and AI technologies..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="goals">Goals for Joining the Cooperative</Label>
                    <Textarea
                      id="goals"
                      rows={4}
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                      placeholder="What do you hope to achieve by joining the SLxAI cooperative?"
                    />
                  </div>

                  {/* Communication Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) => handleInputChange('newsletter', checked)}
                      />
                      <Label htmlFor="newsletter" className="text-sm">
                        Subscribe to our newsletter for updates
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="communications"
                        checked={formData.communications}
                        onCheckedChange={(checked) => handleInputChange('communications', checked)}
                      />
                      <Label htmlFor="communications" className="text-sm">
                        Receive communications about the summit and cooperative
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-electric-blue hover:bg-blue-600 text-white">
                    Submit Founding Member Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="text-electric-blue">Contact</span> Us
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Get in touch with the SLxAI team. We're here to answer questions, explore partnerships, 
              and welcome new members to our global community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center">
              <Mail className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">info@slxai.org</p>
            </Card>

            <Card className="p-6 text-center">
              <Users className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Our Community</h3>
              <p className="text-gray-600">Connect with us on social media and stay updated</p>
            </Card>

            <Card className="p-6 text-center">
              <FileText className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Press Kit</h3>
              <p className="text-gray-600">Download our media resources and brand guidelines</p>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Send Us a Message
                </CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" aria-label="Contact form">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contactFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <Input 
                        id="contactFirstName" 
                        type="text" 
                        required 
                        aria-required="true"
                        className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                      />
                    </div>
                    <div>
                      <label htmlFor="contactLastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <Input 
                        id="contactLastName" 
                        type="text" 
                        required 
                        aria-required="true"
                        className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input 
                      id="contactEmail" 
                      type="email" 
                      required 
                      aria-required="true"
                      className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactOrganization" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization (Optional)
                    </label>
                    <Input 
                      id="contactOrganization" 
                      type="text" 
                      className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactMessage" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea 
                      id="contactMessage" 
                      rows={6} 
                      required 
                      aria-required="true"
                      placeholder="Please provide details about your inquiry..."
                      className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                    />
                  </div>

                  <div className="text-center">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
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
            shape the future of sign language and AI technologies. Secure your company's board seat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-electric-blue hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => scrollToSection('summit')}
            >
              Register for Summit
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
                alt="SLxAI: Sign Language and AI Global Cooperative Logo" 
                className="h-8 w-auto mb-4"
              />
              <div className="h-8 mb-4 text-white font-bold text-lg" style={{display: 'none'}}>
                SLxAI
              </div>
              <p className="text-gray-400">
                Building the future of sign language and AI through global cooperation and ethical standards.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Organization</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors text-left">About</button></li>
                <li><button onClick={() => scrollToSection('membership')} className="hover:text-white transition-colors text-left">Membership</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors text-left">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Programs</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('summit')} className="hover:text-white transition-colors text-left">SLxAI Summit</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors text-left">Education</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors text-left">Policy</button></li>
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
