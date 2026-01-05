'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
        <p className="text-gray-400 mb-8">Last Updated: January 2024</p>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">1. Money-Back Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>We offer a <strong className="text-white">30-day money-back guarantee</strong> on all Pro plan purchases. If you're not satisfied with Clario for any reason, we'll refund your payment in full.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">2. Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">2.1 Refund Window:</strong> Refund requests must be submitted within 30 days of the original purchase date.</p>
              <p><strong className="text-white">2.2 First Purchase Only:</strong> The 30-day guarantee applies to your first Pro plan purchase. Subsequent renewals are not eligible for refunds but can be cancelled to prevent future charges.</p>
              <p><strong className="text-white">2.3 Free Plan:</strong> The free plan has no charges and therefore no refunds apply.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">3. How to Request a Refund</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">3.1 Contact Support:</strong> Email support@clario.ai with your request and reason for refund.</p>
              <p><strong className="text-white">3.2 Provide Details:</strong> Include your account email and order/transaction ID.</p>
              <p><strong className="text-white">3.3 Processing Time:</strong> Refunds are processed within 5-10 business days after approval.</p>
              <p><strong className="text-white">3.4 Refund Method:</strong> Refunds are issued to the original payment method used for purchase.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">4. Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">4.1 Cancel Anytime:</strong> You can cancel your Pro subscription anytime without penalty.</p>
              <p><strong className="text-white">4.2 Access Until End of Billing Period:</strong> You'll retain access to Pro features until the end of your current billing period.</p>
              <p><strong className="text-white">4.3 Automatic Downgrade:</strong> After cancellation, your account automatically reverts to the free plan.</p>
              <p><strong className="text-white">4.4 Data Retention:</strong> All your data, knowledge graph, and history remain intact after downgrade.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">5. Non-Refundable Situations</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">5.1 Outside 30-Day Window:</strong> Refund requests submitted after 30 days are not eligible.</p>
              <p><strong className="text-white">5.2 Subscription Renewals:</strong> Automatic renewal charges cannot be refunded. Cancel before renewal to prevent charges.</p>
              <p><strong className="text-white">5.3 Abuse or Violation:</strong> Accounts violating our Terms of Service are not eligible for refunds.</p>
              <p><strong className="text-white">5.4 Multiple Refund Requests:</strong> Repeated refund requests may result in account suspension.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">6. Billing Issues</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">6.1 Duplicate Charges:</strong> If you're charged twice, contact support immediately with proof. We'll investigate and refund duplicate charges.</p>
              <p><strong className="text-white">6.2 Unauthorized Charges:</strong> Report unauthorized charges within 30 days. We'll investigate and process refunds if applicable.</p>
              <p><strong className="text-white">6.3 Payment Failures:</strong> If a payment fails, you won't be charged. Retry payment or contact support for assistance.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">7. Chargeback Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>If you initiate a chargeback instead of requesting a refund through our process, your account will be permanently suspended. We encourage you to contact support first to resolve any issues.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">8. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>For refund requests or billing questions:</p>
              <p>Email: support@clario.ai<br />Response Time: Within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">9. Policy Changes</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>We may update this policy. Changes take effect immediately. Continued use of the service constitutes acceptance of updated terms.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
