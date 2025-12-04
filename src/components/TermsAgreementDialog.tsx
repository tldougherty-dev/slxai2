import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface TermsAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}

export function TermsAgreementDialog({ open, onOpenChange, onAgree }: TermsAgreementDialogProps) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (agreed) {
      onAgree();
      setAgreed(false); // Reset for next time
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scale className="h-8 w-8 text-electric-blue dark:text-white" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Terms of Service Agreement
            </DialogTitle>
          </div>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
            Please read and agree to the Terms of Service to continue
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Terms Content */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-2 pb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: November 18, 2024</p>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
                <FileText className="h-5 w-5 text-electric-blue dark:text-white" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
              <p>
                By accessing or using the SLxAI Cooperative Member Portal ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
                <Users className="h-5 w-5 text-electric-blue dark:text-white" />
                Membership and Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
              <p>To use the Service, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be a member organization of SLxAI Cooperative</li>
                <li>Have been granted access credentials by an authorized administrator</li>
                <li>Be at least 18 years of age</li>
                <li>Provide accurate and complete information when registering</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
              <p className="mt-4">
                Membership may be revoked for violation of these Terms or cooperative policies.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
                <Shield className="h-5 w-5 text-electric-blue dark:text-white" />
                User Conduct
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Harass, abuse, or harm other members</li>
                <li>Post false, misleading, or defamatory content</li>
                <li>Violate intellectual property rights of others</li>
                <li>Spam or send unsolicited communications</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="dark:text-white text-lg">Privacy and Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
              <p>
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding your personal information.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
                <AlertCircle className="h-5 w-5 text-electric-blue dark:text-white" />
                Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
                <CheckCircle className="h-5 w-5 text-electric-blue dark:text-white" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <div className="space-y-2">
                <p><strong className="dark:text-white">Email:</strong> <span className="dark:text-gray-300">legal@slxai.org</span></p>
                <p><strong className="dark:text-white">Address:</strong> <span className="dark:text-gray-300">SLxAI Cooperative</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Checkbox
            id="terms-agreement"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-1"
          />
          <label
            htmlFor="terms-agreement"
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
          >
            I have read and agree to the Terms of Service. I understand that by proceeding, I am bound by these terms.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 border-gray-300 dark:border-gray-600 dark:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAgree}
            disabled={!agreed}
            className="flex-1 bg-electric-blue hover:bg-electric-blue/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            I Agree & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

