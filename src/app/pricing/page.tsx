'use client'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Star, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with AI-powered productivity',
    features: [
      '100 AI requests per month',
      'Text Summarizer (6 modes)',
      'AI Chat powered by Groq',
      'Document Analysis',
      'Writing Assistant',
      'Meeting Notes Generator',
      'Basic analytics dashboard',
      'Email support',
      'Secure data storage',
      'Mobile responsive',
    ],
    cta: 'Start Free',
    popular: false,
    tier: 'free' as const,
    gradient: 'from-gray-500 to-gray-700',
  },
  {
    name: 'Pro',
    price: '$20',
    period: 'month',
    description: 'For power users who need unlimited productivity',
    features: [
      '1000 AI requests per month',
      'Text Summarizer (6 modes)',
      'AI Chat powered by Groq',
      'Document Analysis',
      'Writing Assistant',
      'Meeting Notes Generator',
      'Advanced analytics & insights',
      'Priority email support',
      'Priority processing speed',
      'Early access to new features',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    tier: 'pro' as const,
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'Most Popular',
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSubscribe = (tier: 'free' | 'pro') => {
    if (!user) {
      router.push(`/sign-up?redirect=/pricing`)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black/50 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <Badge className="mb-3 sm:mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Simple Pricing
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 px-4">
              Choose Your Plan
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Start free with 100 requests per month or upgrade to Pro for 1000 requests.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto mb-12 sm:mb-16 md:mb-20">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="flex"
              >
                <Card
                  className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] border w-full flex flex-col transition-all duration-500 hover:scale-[1.02] ${
                    plan.popular
                      ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 text-white border-0 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold shadow-lg">
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5 fill-white" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3 sm:pb-4 pt-6 sm:pt-8 px-4 sm:px-6">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3 sm:mb-4 shadow-xl`}>
                      <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                    <div className="mt-2 sm:mt-3 mb-3 sm:mb-4">
                      <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{plan.price}</span>
                      <span className="text-gray-400 text-sm sm:text-base ml-2">/{plan.period}</span>
                    </div>
                    <CardDescription className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                    <ul className="space-y-2 sm:space-y-2.5 flex-1 mb-4 sm:mb-6">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15 + i * 0.05 }}
                          className="flex items-start gap-2 sm:gap-2.5"
                        >
                          <div className={`mt-0.5 rounded-full p-0.5 sm:p-1 bg-gradient-to-br ${plan.gradient} flex-shrink-0 shadow-md`}>
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white stroke-[3]" />
                          </div>
                          <span className="text-gray-200 text-xs sm:text-sm leading-relaxed">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <div className="space-y-2">
                      <Button
                        size="lg"
                        className={`w-full text-sm sm:text-base font-bold py-4 sm:py-5 rounded-xl transition-all duration-300 shadow-xl ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 text-white'
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                        onClick={() => handleSubscribe(plan.tier)}
                      >
                        {plan.cta}
                      </Button>
                      <p className="text-center text-[10px] sm:text-xs text-gray-500">
                        {plan.tier === 'free' ? 'No credit card required' : '30-day money-back guarantee'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Features Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              All Plans Include
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Enterprise Security</h3>
                  <p className="text-sm text-gray-400">Row Level Security, rate limiting, and encryption</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                  <p className="text-sm text-gray-400">Powered by Groq and Google Gemini AI</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
                  <p className="text-sm text-gray-400">Track usage and performance insights</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white text-lg">What happens if I exceed my request limit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    You'll be notified when approaching your limit. Free users can upgrade to Pro for more requests, or wait until next month when limits reset.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Can I cancel my Pro plan anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Yes! Cancel anytime with no questions asked. You'll keep access until the end of your billing period, then automatically move to the free plan.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white text-lg">What counts as a request?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Each AI operation counts as one request: summarization, chat message, document analysis, writing assistance, or meeting notes generation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Is there a money-back guarantee?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-20 text-center"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 backdrop-blur-sm p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                  Start with the free plan or upgrade to Pro for 10x more requests.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button className="bg-white text-black hover:bg-white/90 px-8">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
