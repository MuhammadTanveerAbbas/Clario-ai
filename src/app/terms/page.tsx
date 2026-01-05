"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">
          Terms and Conditions
        </h1>
        <p className="text-gray-400 mb-8">Last Updated: January 2024</p>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                By accessing and using Clario, you accept and agree to be bound
                by these terms. These Terms govern your use of our AI powered
                productivity platform.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                2. Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Clario provides AI powered tools including Text Summarizer, AI
                Chat, Document Analyzer, and Writing Assistant with real-time
                analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                3. Subscription Plans and Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                <strong className="text-white">3.1 Plans:</strong> Free ($0),
                Pro ($9.99/month), Premium ($29.99/month)
              </p>
              <p>
                <strong className="text-white">3.2 Billing:</strong> Paid
                subscriptions are billed monthly via Paddle payment processor.
              </p>
              <p>
                <strong className="text-white">3.3 Free Trial:</strong> 7-day
                trial for paid plans. Cancel anytime during trial without
                charge.
              </p>
              <p>
                <strong className="text-white">3.4 Auto-Renewal:</strong>{" "}
                Subscriptions auto-renew unless cancelled before renewal date.
              </p>
              <p>
                <strong className="text-white">3.5 Price Changes:</strong> 30
                days advance notice for price modifications.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">4. Usage Limits</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Each tier has monthly usage limits. Exceeding limits requires
                upgrade. Service abuse may result in account suspension.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">5. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                You are responsible for account security. Provide accurate
                information. Notify us of unauthorized access immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                6. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                All Service content is owned by Clario. You retain ownership of
                submitted content and grant us license to process it.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">7. Data Processing</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We comply with GDPR and CCPA. Industry-standard security
                including encryption, RLS, and rate limiting protects your data.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                8. Refunds and Cancellations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                30-day money-back guarantee. Cancel anytime. Cancellations
                effective at end of billing period. See Refund Policy for
                details.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                9. Service Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We target 99.9% uptime. Maintenance may temporarily affect
                availability. Not liable for service interruptions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                10. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Not liable for indirect damages. Total liability limited to
                amount paid in preceding 12 months.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">11. Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>Email: support@clario.ai</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
