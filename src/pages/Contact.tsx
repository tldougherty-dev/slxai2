import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Users, FileText, Heart, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="text-electric-blue">Contact</span> Us
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Get in touch with the SLxAI team. We're here to answer questions, explore partnerships, 
            and welcome new members to our global community.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input 
                      id="firstName" 
                      type="text" 
                      required 
                      aria-required="true"
                      className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <Input 
                      id="lastName" 
                      type="text" 
                      required 
                      aria-required="true"
                      className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    aria-required="true"
                    className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization (Optional)
                  </label>
                  <Input 
                    id="organization" 
                    type="text" 
                    className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue"
                  />
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type *
                  </label>
                  <Select>
                    <SelectTrigger className="border-gray-300 focus:border-electric-blue focus:ring-electric-blue">
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="press">Press & Media</SelectItem>
                      <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                      <SelectItem value="volunteer">Volunteer Interest</SelectItem>
                      <SelectItem value="membership">Membership Questions</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea 
                    id="message" 
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
      </section>

      {/* Additional Contact Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
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

export default Contact;
