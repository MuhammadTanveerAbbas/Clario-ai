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
        <p className="text-gray-400 mb-8">Last Updated: October 8, 2025</p>

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
                productivity platform. Clario uses Paddle as the Merchant of Record for all transactions.
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
                Clario provides AI-powered tools including Text Summarizer (10 modes), AI
                Chat, Writing Assistant (5 actions), Meeting Notes Generator, and Quick Notes
                with real-time analytics and usage tracking.
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
                <strong className="text-white">3.1 Plans:</strong> Free ($0/month with 100 requests),
                Pro ($20/month with 1000 requests)
              </p>
              <p>
                <strong className="text-white">3.2 Merchant of Record:</strong> Paddle acts as the
                Merchant of Record for all transactions. For US-based customers: Paddle.com Inc.
                For UK-based customers (VAT purposes): Paddle Payments Limited. For all other
                customers: Paddle.com Market Limited. Paddle's Master Services Agreement governs
                the reseller relationship.
              </p>
              <p>
                <strong className="text-white">3.3 Billing:</strong> Pro subscription is
                billed monthly via Paddle. Paddle handles all payment processing, sales tax collection,
                VAT compliance, and invoicing.
              </p>
              <p>
                <strong className="text-white">3.4 Free Plan:</strong> No credit card required.
                Start using all features immediately with 100 requests per month.
              </p>
              <p>
                <strong className="text-white">3.5 Auto-Renewal:</strong>{" "}
                Pro subscription auto-renews unless cancelled before renewal date.
              </p>
              <p>
                <strong className="text-white">3.6 Price Changes:</strong> 30
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
                <strong className="text-white">4.1 Request Limits:</strong> Free plan: 100 requests/month.
                Pro plan: 1000 requests/month. Each AI operation (summarization, chat message,
                writing assistance, meeting notes, or quick note) counts as one request.
              </p>
              <p>
                <strong className="text-white">4.2 Exceeding Limits:</strong> Exceeding limits requires
                upgrade to Pro plan. Limits reset monthly on your signup date.
              </p>
              <p>
                <strong className="text-white">4.3 Fair Use:</strong> Service abuse or excessive
                automated usage may result in account suspension.
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
              <CardTitle className="text-white">6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                <strong className="text-white">6.1 Service Ownership:</strong> All Service content,
                features, and functionality are owned by Clario and Muhammad Tanveer Abbas.
              </p>
              <p>
                <strong className="text-white">6.2 User Content:</strong> You retain ownership of
                content you submit. By using the Service, you grant us a license to process,
                store, and display your content solely to provide the Service.
              </p>
              <p>
                <strong className="text-white">6.3 AI-Generated Content:</strong> Content generated
                by AI features is provided to you for your use. We do not claim ownership of
                AI-generated outputs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">7. Data Processing and AI Services</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                <strong className="text-white">7.1 AI Models:</strong> We use Groq SDK (Llama 3.1 8B
                for chat, Llama 3.3 70B for writing, meeting notes, and text summarization).
                Your content is processed by these third-party AI services.
              </p>
              <p>
                <strong className="text-white">7.2 Data Processing:</strong> Content submitted for AI
                processing is sent to our AI providers. Data is not stored by AI providers beyond
                processing time.
              </p>
              <p>
                <strong className="text-white">7.3 Privacy Compliance:</strong> We comply with GDPR
                and CCPA. See our Privacy Policy for details.
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
                <strong className="text-white">8.1 Money-Back Guarantee:</strong> 30-day money-back
                guarantee on first Pro plan purchase. Refunds are processed by Paddle as Merchant of Record.
              </p>
              <p>
                <strong className="text-white">8.2 Cancellation:</strong> Cancel Pro subscription
                anytime. Access continues until end of billing period, then account reverts to
                Free plan.
              </p>
              <p>
                <strong className="text-white">8.3 Refund Process:</strong> See our Refund Policy
                for complete details on eligibility and process. Contact support@clario.ai for refund requests.
              </p>
              <p>
                <strong className="text-white">8.4 Chargebacks:</strong> If you initiate a chargeback
                instead of requesting a refund, your account will be suspended. Contact support first
                to resolve issues.
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
                <strong className="text-white">10.1 Service Provided "As Is":</strong> The Service
                is provided without warranties of any kind. AI-generated content may contain errors.
              </p>
              <p>
                <strong className="text-white">10.2 Liability Limit:</strong> Our total liability
                is limited to the amount you paid in the preceding 12 months.
              </p>
              <p>
                <strong className="text-white">10.3 No Indirect Damages:</strong> We are not liable
                for indirect, incidental, or consequential damages.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We may update these Terms. Material changes will be notified via email 30 days
                in advance. Continued use after changes constitutes acceptance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                These Terms are governed by the laws of England and Wales. The English courts
                have exclusive jurisdiction over any disputes arising under these Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">13. Acceptable Use Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                <strong className="text-white">13.1 Prohibited Activities:</strong> You may not use
                Clario for any unlawful purpose or in violation of Paddle's Acceptable Use Policy.
              </p>
              <p>
                <strong className="text-white">13.2 Content Restrictions:</strong> Do not submit content
                that infringes intellectual property rights, contains malware, promotes violence, or
                violates applicable laws.
              </p>
              <p>
                <strong className="text-white">13.3 Account Suspension:</strong> Violation of this policy
                may result in immediate account suspension or termination without refund.
              </p>
              <p>
                <strong className="text-white">13.4 Full Policy:</strong> Review Paddle's complete
                Acceptable Use Policy at https://paddle.com/support/aup/
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">14. Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                <strong className="text-white">Service Provider:</strong> Muhammad Tanveer Abbas
              </p>
              <p>
                <strong className="text-white">Email:</strong> support@clario.ai
              </p>
              <p>
                <strong className="text-white">Website:</strong> https://clario.ai
              </p>
              <p>
                <strong className="text-white">Payment Processor:</strong> Paddle (Merchant of Record)<br />
                Paddle Legal: legal@paddle.com<br />
                Paddle Terms: https://paddle.com/legal
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
