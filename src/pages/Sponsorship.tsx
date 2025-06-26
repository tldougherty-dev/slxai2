import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Star, Globe, Users, Award, Mail, Phone, MapPin, ExternalLink, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sponsorship = () => {
  const [selectedTier, setSelectedTier] = useState('gold');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    role: '',
    sponsorshipTier: 'gold',
    message: '',
    newsletter: true,
    communications: true
  });

  const sponsorshipTiers = [
    {
      id: 'platinum',
      title: 'Platinum Sponsor',
      price: '$10,000',
      icon: <Star className="h-8 w-8" />,
      description: 'Premier sponsorship with maximum visibility and influence',
      features: [
        'Naming rights for the summit',
        'Keynote speaking opportunity',
        'Exclusive VIP dinner with speakers',
        'Premium booth space (10x10)',
        'Logo on all summit materials',
        'Social media recognition',
        '10 complimentary summit passes',
        'Strategic advisory role',
        'Lifetime recognition on website'
      ],
      color: 'from-purple-500 to-purple-600',
      limited: true,
      spotsRemaining: 2
    },
    {
      id: 'gold',
      title: 'Gold Sponsor',
      price: '$5,000',
      icon: <Award className="h-8 w-8" />,
      description: 'Major sponsorship with significant visibility',
      features: [
        'Panel speaking opportunity',
        'Premium booth space (8x8)',
        'Logo on summit materials',
        'Social media recognition',
        '6 complimentary summit passes',
        'Networking event sponsorship',
        'Website recognition',
        'Research collaboration opportunities'
      ],
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'silver',
      title: 'Silver Sponsor',
      price: '$2,500',
      icon: <Globe className="h-8 w-8" />,
      description: 'Standard sponsorship with good visibility',
      features: [
        'Standard booth space (6x6)',
        'Logo on summit materials',
        'Social media recognition',
        '4 complimentary summit passes',
        'Website recognition',
        'Networking opportunities',
        'Research partnership access'
      ],
      color: 'from-gray-400 to-gray-500'
    },
    {
      id: 'bronze',
      title: 'Bronze Sponsor',
      price: '$1,000',
      icon: <Users className="h-8 w-8" />,
      description: 'Supporting sponsorship with basic visibility',
      features: [
        'Small booth space (4x4)',
        'Logo on summit materials',
        'Social media recognition',
        '2 complimentary summit passes',
        'Website recognition',
        'Networking opportunities'
      ],
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sponsorship inquiry submitted:', { tier: selectedTier, ...formData });
    // Here you would typically send the data to your backend
    alert('Thank you for your sponsorship inquiry! We will contact you soon to discuss opportunities.');
  };

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
            Sponsor Our Mission
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join us in advancing sign language AI technologies and supporting the global Deaf community. 
            Your sponsorship helps us create standards, build community, and drive innovation.
          </p>
          <div className="bg-electric-blue text-white p-6 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Why Sponsor SLxAI?</h2>
            <p className="text-blue-100">
              Support cutting-edge research, connect with leading experts, and demonstrate your commitment 
              to accessibility and inclusion in AI technology.
            </p>
          </div>
        </div>

        {/* Sponsorship Tiers */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sponsorship Opportunities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the sponsorship level that aligns with your organization's goals and budget
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {sponsorshipTiers.map((tier) => (
              <Card 
                key={tier.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedTier === tier.id 
                    ? 'ring-2 ring-electric-blue shadow-lg' 
                    : 'hover:scale-105'
                } ${tier.limited ? 'relative overflow-hidden' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
              >
                {tier.limited && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg font-semibold z-10">
                    LIMITED
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center text-white`}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-xl">{tier.title}</CardTitle>
                  <div className="text-3xl font-bold text-electric-blue">{tier.price}</div>
                  <p className="text-gray-600 text-sm">{tier.description}</p>
                  {tier.limited && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm font-semibold">
                        Only {tier.spotsRemaining} spots remaining!
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sponsorship Benefits
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Beyond the specific tier benefits, all sponsors receive these additional advantages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-electric-blue to-blue-600 flex items-center justify-center text-white">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Reach</h3>
              <p className="text-gray-600">
                Connect with researchers, developers, and advocates from around the world working on sign language AI technologies.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-electric-blue to-blue-600 flex items-center justify-center text-white">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Industry Recognition</h3>
              <p className="text-gray-600">
                Demonstrate your commitment to accessibility and inclusion in the rapidly growing field of AI technology.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-electric-blue to-blue-600 flex items-center justify-center text-white">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Networking</h3>
              <p className="text-gray-600">
                Build relationships with key stakeholders in the sign language AI ecosystem and explore collaboration opportunities.
              </p>
            </Card>
          </div>
        </section>

        {/* Sponsorship Form */}
        <section className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sponsorship Inquiry</CardTitle>
              <p className="text-gray-600">
                Complete the form below to express interest in sponsorship
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
                </div>

                {/* Organization Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organization">Organization Name *</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Your Role *</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Sponsorship Tier Selection */}
                <div>
                  <Label htmlFor="sponsorshipTier">Preferred Sponsorship Tier *</Label>
                  <Select
                    value={formData.sponsorshipTier}
                    onValueChange={(value) => handleInputChange('sponsorshipTier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sponsorship tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {sponsorshipTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.title} - {tier.price}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">
                        Other - Custom Amount
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your organization, goals, and any specific interests in our work..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange('newsletter', checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for updates on our work and upcoming events
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="communications"
                      checked={formData.communications}
                      onCheckedChange={(checked) => handleInputChange('communications', checked)}
                    />
                    <Label htmlFor="communications" className="text-sm">
                      I agree to receive communications about sponsorship opportunities and SLxAI updates
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Submit Sponsorship Inquiry
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Contact Information */}
        <section className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Questions About Sponsorship?</CardTitle>
              <p className="text-gray-600">
                Our team is here to help you find the perfect sponsorship opportunity
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-electric-blue" />
                  <span>info@slxai.org</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16" role="contentinfo" aria-label="Footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/slxai-footer-logo.png" 
                alt="SLxAI: Sign Language AI Global Cooperative Logo" 
                className="h-8 w-auto mb-4"
              />
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

export default Sponsorship; 