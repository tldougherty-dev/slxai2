import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, FileText, CheckCircle, Clock, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Benchmarks = () => {
  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              SLxAI <span className="text-electric-blue">Benchmarks</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Industry-standard evaluation framework for sign language AI technologies, 
              ensuring quality, accessibility, and ethical development.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-700">
                Our comprehensive benchmarking system is currently in development. 
                Subscribe to our newsletter to be notified when it launches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How SLxAI Benchmarks Work</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive evaluation framework assesses sign language AI technologies across 
              multiple dimensions to ensure quality and accessibility.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-l-4 border-l-electric-blue">
              <CardHeader>
                <Award className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-lg">Accuracy Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Comprehensive evaluation of recognition accuracy across multiple sign languages and contexts.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-l-4 border-l-electric-blue">
              <CardHeader>
                <FileText className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-lg">Cultural Authenticity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Assessment of cultural representation and authenticity in avatar movements and expressions.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-l-4 border-l-electric-blue">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-lg">Accessibility Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Evaluation of accessibility features and usability for diverse Deaf and hard-of-hearing users.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-l-4 border-l-electric-blue">
              <CardHeader>
                <Award className="h-12 w-12 text-electric-blue mx-auto mb-4" aria-hidden="true" />
                <CardTitle className="text-lg">Ethical Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Review of ethical development practices and community involvement in the creation process.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Development Stages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">ASL Development Stages</h2>
            <p className="text-xl text-gray-600">
              Our evaluation framework follows the linguistic progression from basic phonemes to native-like performance
            </p>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start">
                <div className="bg-electric-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Manual Alphabet and Numbers</h3>
                  <p className="text-gray-600 mb-3">Handles fingerspelling A-Z and basic numeric signs. Avatar: Clear manual alphabet and number signs. SLR: Recognizes handshapes for letters and digits.</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800"><strong>Vocabulary:</strong> &lt;40 symbols</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="bg-electric-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Isolated Lexicon (Basic Words)</h3>
                  <p className="text-gray-600 mb-3">Fixed vocabulary of isolated signs (tens to hundreds of everyday signs). Avatar: Individual signs with default mouthing. SLR: Classifies isolated signs with high accuracy.</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800"><strong>Vocabulary:</strong> Tens to hundreds of signs</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="bg-electric-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Phrase/Simple Sentence</h3>
                  <p className="text-gray-600 mb-3">Short sentences in constrained contexts. Avatar: Basic transitions, limited facial expressions. SLR: Sequences of 2-3 signs, simple sentences.</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800"><strong>Complexity:</strong> Common phrases, domain-specific prompts</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="bg-electric-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">4</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Complex Sentences with Grammar</h3>
                  <p className="text-gray-600 mb-3">Full sentences with proper grammatical structure. Avatar: Multi-clause sentences, non-manual markers, spatial referencing. SLR: Continuous signing, 20-40% error rate.</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800"><strong>Vocabulary:</strong> Hundreds to thousands of signs</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="bg-electric-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">5</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Discourse and Interactive Dialogue</h3>
                  <p className="text-gray-600 mb-3">Multi-sentence discourse and interactive communication. Avatar: Context maintenance, turn-taking signals, pragmatic functions. SLR: Real-time conversation transcription.</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800"><strong>Proficiency:</strong> Near-native territory</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start">
                <div className="bg-electric-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">6</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Native-Like Performance</h3>
                  <p className="text-gray-600 mb-3">Essentially as effective as a fluent human. Avatar: Indistinguishable from human interpreter, cultural subtleties. SLR: Full detail capture, automatic interpretation.</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800"><strong>Status:</strong> Aspirational goal (not yet achieved)</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Reports Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sample Evaluation Reports</h2>
            <p className="text-xl text-gray-600">
              Preview of what our comprehensive evaluation reports will include
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Avatar Technology Report</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Development Stage</span>
                  <span className="text-electric-blue font-semibold">Level 3</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Linguistic Accuracy</span>
                  <span className="text-electric-blue font-semibold">85%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Expressiveness</span>
                  <span className="text-electric-blue font-semibold">B+</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Comprehensibility</span>
                  <span className="text-electric-blue font-semibold">A-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">User Acceptance</span>
                  <span className="text-electric-blue font-semibold">B</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">SLR Model Report</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Development Stage</span>
                  <span className="text-electric-blue font-semibold">Level 4</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Sign Error Rate</span>
                  <span className="text-electric-blue font-semibold">28%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Grammar Awareness</span>
                  <span className="text-electric-blue font-semibold">B+</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Signer Independence</span>
                  <span className="text-electric-blue font-semibold">A-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-700">Real-time Performance</span>
                  <span className="text-electric-blue font-semibold">A</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Submission Form Preview */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Submit Your Technology for Evaluation
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Once launched, organizations will be able to submit their sign language AI technologies 
            for comprehensive evaluation and certification.
          </p>
          <Card className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Evaluation Process</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-2xl font-bold text-electric-blue mb-2">1</div>
                <h4 className="font-semibold text-gray-900 mb-2">Submit Application</h4>
                <p className="text-gray-600">Provide detailed information about your technology and development process.</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-electric-blue mb-2">2</div>
                <h4 className="font-semibold text-gray-900 mb-2">Technical Review</h4>
                <p className="text-gray-600">Our experts conduct comprehensive testing and evaluation.</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-electric-blue mb-2">3</div>
                <h4 className="font-semibold text-gray-900 mb-2">Receive Report</h4>
                <p className="text-gray-600">Get detailed feedback and certification results.</p>
              </div>
            </div>
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

export default Benchmarks;
