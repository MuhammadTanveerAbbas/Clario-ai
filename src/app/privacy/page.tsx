'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last Updated: January 2024</p>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">1.1 Account Information:</strong> Email address, password (encrypted), subscription tier, and payment information (processed by Paddle).</p>
              <p><strong className="text-white">1.2 Usage Data:</strong> AI summaries count, chat messages, document analyses, writing sessions, feature usage patterns, and timestamps.</p>
              <p><strong className="text-white">1.3 Content Data:</strong> Text submitted for summarization, chat conversations, uploaded documents, and writing assistant inputs.</p>
              <p><strong className="text-white">1.4 Technical Data:</strong> IP address, browser type, device information, and session data.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">2.1 Service Delivery:</strong> Process AI requests, provide chat responses, analyze documents, and deliver writing assistance.</p>
              <p><strong className="text-white">2.2 Usage Tracking:</strong> Monitor monthly limits, track feature usage, and provide analytics dashboard.</p>
              <p><strong className="text-white">2.3 Billing:</strong> Process payments, manage subscriptions, and handle refunds via Paddle.</p>
              <p><strong className="text-white">2.4 Improvements:</strong> Analyze usage patterns, improve AI models, and enhance features.</p>
              <p><strong className="text-white">2.5 Communications:</strong> Send service updates, billing notifications, and security alerts.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">3. Data Processing and AI Services</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">3.1 Groq SDK:</strong> Chat messages and document content are processed by Groq's language models. Data is not stored by Groq beyond processing.</p>
              <p><strong className="text-white">3.2 Google Gemini:</strong> Text submitted for summarization is processed by Google Gemini API. Google's privacy policy applies to this processing.</p>
              <p><strong className="text-white">3.3 Data Retention:</strong> Content is temporarily stored for processing and deleted after 30 days unless saved by user.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">4.1 Encryption:</strong> All data transmitted using TLS/SSL encryption. Passwords hashed using industry-standard algorithms.</p>
              <p><strong className="text-white">4.2 Row Level Security:</strong> Database implements RLS to ensure users only access their own data.</p>
              <p><strong className="text-white">4.3 Rate Limiting:</strong> API rate limiting prevents abuse and protects against attacks.</p>
              <p><strong className="text-white">4.4 Monitoring:</strong> Sentry tracks errors and security incidents. PostHog provides privacy-focused analytics.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">5. Data Sharing and Third Parties</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">5.1 Payment Processing:</strong> Paddle processes all payments. Their privacy policy governs payment data.</p>
              <p><strong className="text-white">5.2 Infrastructure:</strong> Supabase hosts our database. Vercel hosts our application.</p>
              <p><strong className="text-white">5.3 Analytics:</strong> PostHog provides privacy-focused analytics. No personal data sold to third parties.</p>
              <p><strong className="text-white">5.4 Legal Requirements:</strong> We may disclose data to comply with legal obligations or protect rights.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">6. Your Rights (GDPR & CCPA)</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">6.1 Access:</strong> Request copy of your personal data.</p>
              <p><strong className="text-white">6.2 Correction:</strong> Update inaccurate information in account settings.</p>
              <p><strong className="text-white">6.3 Deletion:</strong> Request account and data deletion (30-day retention for backups).</p>
              <p><strong className="text-white">6.4 Portability:</strong> Export your data in machine-readable format.</p>
              <p><strong className="text-white">6.5 Opt-Out:</strong> Unsubscribe from marketing emails anytime.</p>
              <p><strong className="text-white">6.6 Do Not Sell:</strong> We do not sell personal information.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">7. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">7.1 Essential Cookies:</strong> Authentication, session management, and security.</p>
              <p><strong className="text-white">7.2 Analytics:</strong> PostHog tracks usage patterns (privacy-focused, no personal data).</p>
              <p><strong className="text-white">7.3 Control:</strong> Manage cookies through browser settings.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">8. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">8.1 Active Accounts:</strong> Data retained while account is active.</p>
              <p><strong className="text-white">8.2 Deleted Accounts:</strong> Data deleted within 30 days of account deletion.</p>
              <p><strong className="text-white">8.3 Billing Records:</strong> Retained for 7 years for tax and legal compliance.</p>
              <p><strong className="text-white">8.4 Content:</strong> Temporary content deleted after 30 days unless saved.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>Our Service is not intended for users under 13. We do not knowingly collect data from children. If we discover such data, we delete it immediately.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">10. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>Data may be transferred to and processed in countries outside your residence. We ensure adequate safeguards through standard contractual clauses.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">11. Changes to Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>We may update this policy. Material changes will be notified via email. Continued use after changes constitutes acceptance.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">12. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>For privacy questions or to exercise your rights:</p>
              <p>Email: privacy@clario.ai<br />Data Protection Officer: dpo@clario.ai</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
