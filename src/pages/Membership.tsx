import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Award, Globe, Star, CheckCircle, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Membership = () => {
  const [selectedTier, setSelectedTier] = useState('individual');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    role: '',
    country: '',
    phone: '',
    interests: [],
    experience: '',
    goals: '',
    newsletter: true,
    communications: true
  });

  const membershipTiers = [
    {
      id: 'individual',
      title: 'Individual Member',
      price: '$250',
      period: 'per year',
      icon: <Users className="h-8 w-8" />,
      description: 'For researchers, developers, and advocates',
      features: [
        'Access to research resources',
        'Member directory access',
        'Newsletter subscription',
        'Event discounts',
        'Community forum access'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'organization',
      title: 'Organization Member',
      price: '$1,000',
      period: 'per year',
      icon: <Globe className="h-8 w-8" />,
      description: 'For institutions, companies, and nonprofits',
      features: [
        'All individual benefits',
        'Up to 5 team members',
        'Priority support',
        'Collaboration opportunities',
        'Policy influence',
        'Research partnerships'
      ],
      color: 'from-electric-blue to-blue-600'
    },
    {
      id: 'founding',
      title: 'Founding Member',
      price: '$5,000',
      period: 'per year',
      icon: <Star className="h-8 w-8" />,
      description: 'For early supporters and leaders',
      features: [
        'All organization benefits',
        'Unlimited team members',
        'Board advisory role',
        'Exclusive events',
        'Named recognition',
        'Strategic influence',
        'Lifetime legacy status'
      ],
      color: 'from-purple-500 to-purple-600',
      limited: true,
      spotsRemaining: 11
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
    console.log('Membership application submitted:', { tier: selectedTier, ...formData });
    // Here you would typically send the data to your backend
    alert('Thank you for your membership application! We will contact you soon.');
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
            Join Our Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Become a member of Sign Language AI Nexus and help shape the future of 
            sign language technology development.
          </p>
        </div>

        {/* Membership Tiers */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Membership Tier
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the membership level that best fits your needs and goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {membershipTiers.map((tier) => (
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
                  <div className="text-gray-500">{tier.period}</div>
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
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Membership Form */}
        <section className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Membership Application</CardTitle>
              <p className="text-gray-600">
                Complete the form below to apply for {membershipTiers.find(t => t.id === selectedTier)?.title} membership
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Organization Information */}
                {selectedTier !== 'individual' && (
                  <>
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
                  </>
                )}

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience and Goals */}
                <div>
                  <Label htmlFor="experience">Experience with Sign Language AI</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Learning about the field</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                      <SelectItem value="advanced">Advanced - Significant experience</SelectItem>
                      <SelectItem value="expert">Expert - Leading in the field</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goals">Goals and Interests</Label>
                  <Textarea
                    id="goals"
                    placeholder="Tell us about your goals and what you hope to achieve through membership..."
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Communication Preferences */}
                <div className="space-y-3">
                  <Label>Communication Preferences</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange('newsletter', checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for updates and research
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="communications"
                      checked={formData.communications}
                      onCheckedChange={(checked) => handleInputChange('communications', checked)}
                    />
                    <Label htmlFor="communications" className="text-sm">
                      Receive communications about events and opportunities
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-electric-blue hover:bg-electric-blue/90 text-white px-8"
                  >
                    Submit Membership Application
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Benefits Section */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Join SLxAI?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with experts, access resources, and contribute to the future of sign language AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Award className="h-12 w-12 text-electric-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Network</h3>
              <p className="text-gray-600">
                Connect with leading researchers, developers, and advocates in sign language AI
              </p>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 text-electric-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Impact</h3>
              <p className="text-gray-600">
                Contribute to shaping policies and standards that affect Deaf communities worldwide
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-electric-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Join a diverse community committed to ethical and inclusive AI development
              </p>
            </div>
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

export default Membership;
