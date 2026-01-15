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
        <p className="text-gray-400 mb-8">Last Updated: October 8, 2025</p>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">1.1 Account Information:</strong> Email address, password (encrypted), subscription tier (Free or Pro), and payment information (processed securely by Stripe).</p>
              <p><strong className="text-white">1.2 Usage Data:</strong> AI request counts (summaries, chat messages, writing sessions, meeting notes, quick notes), feature usage patterns, and timestamps.</p>
              <p><strong className="text-white">1.3 Content Data:</strong> Text submitted for summarization, chat conversations, writing drafts, meeting transcripts, and quick notes you create.</p>
              <p><strong className="text-white">1.4 Technical Data:</strong> IP address, browser type, device information, and session data for security and analytics.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">2.1 Service Delivery:</strong> Process AI requests, provide chat responses, analyze text, deliver writing assistance, and generate meeting notes.</p>
              <p><strong className="text-white">2.2 Usage Tracking:</strong> Monitor monthly request limits (100 for Free, 1000 for Pro), track feature usage, and provide analytics dashboard.</p>
              <p><strong className="text-white">2.3 Billing:</strong> Process payments for Pro subscriptions ($20/month), manage subscriptions, and handle refunds via Stripe.</p>
              <p><strong className="text-white">2.4 Improvements:</strong> Analyze usage patterns to improve AI models and enhance features.</p>
              <p><strong className="text-white">2.5 Communications:</strong> Send service updates, billing notifications, and security alerts.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">3. Data Processing and AI Services</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">3.1 Groq SDK:</strong> All AI features (chat messages, writing content, meeting notes, and text summarization) are processed by Groq's Llama models (Llama 3.1 8B for chat, Llama 3.3 70B for writing, meeting notes, and summarization). Data is not stored by Groq beyond processing.</p>
              <p><strong className="text-white">3.2 Data Retention:</strong> Your content is stored in your account. You can delete it anytime. Deleted content is removed within 30 days including backups.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">4.1 Encryption:</strong> All data transmitted using TLS 1.3 encryption. Passwords hashed using bcrypt with salt rounds. Session tokens encrypted at rest.</p>
              <p><strong className="text-white">4.2 Row Level Security:</strong> Database implements RLS policies ensuring users only access their own data. All queries are scoped to authenticated user ID.</p>
              <p><strong className="text-white">4.3 Rate Limiting:</strong> API rate limiting (60 req/min default, 5 req/min auth, 20 req/min AI) prevents abuse. Failed login attempts trigger temporary IP blocks (15 minutes after 5 failures).</p>
              <p><strong className="text-white">4.4 Security Headers:</strong> HSTS, CSP, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), and strict Permissions-Policy implemented.</p>
              <p><strong className="text-white">4.5 Cookie Security:</strong> HttpOnly, Secure, SameSite=Strict cookies with __Host- or __Secure- prefixes. CSRF tokens on all state-changing operations.</p>
              <p><strong className="text-white">4.6 Monitoring:</strong> Sentry tracks errors and security incidents. Real-time alerts for suspicious activity.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">5. Data Sharing and Third Parties</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p><strong className="text-white">5.1 Payment Processing:</strong> Stripe processes all payments securely. Stripe's privacy policy at https://stripe.com/privacy governs payment data.</p>
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
              <p><strong className="text-white">7.1 Essential Cookies:</strong> Authentication tokens, session management, security tokens, and CSRF protection. These cookies use __Host- or __Secure- prefixes for enhanced security.</p>
              <p><strong className="text-white">7.2 Analytics:</strong> PostHog tracks usage patterns with privacy-focused, anonymized data. No personal information is collected.</p>
              <p><strong className="text-white">7.3 Security Features:</strong> All cookies are HttpOnly, Secure (in production), SameSite=Strict, and have a maximum age of 7 days.</p>
              <p><strong className="text-white">7.4 Control:</strong> Manage cookies through browser settings. Disabling essential cookies may affect functionality.</p>
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
              <p><strong className="text-white">12.1 Service Provider:</strong> Muhammad Tanveer Abbas</p>
              <p><strong className="text-white">12.2 Payment Processor:</strong> Stripe</p>
              <p><strong className="text-white">12.3 Contact Methods:</strong></p>
              <p>For privacy questions or to exercise your rights:</p>
              <p>Email: privacy@clario.ai<br />Data Protection Officer: dpo@clario.ai<br />Website: https://clario.ai</p>
              <p><strong className="text-white">12.4 Stripe Contact:</strong></p>
              <p>For payment-related privacy inquiries:<br />Stripe Privacy Policy: https://stripe.com/privacy<br />Stripe Support: https://support.stripe.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
