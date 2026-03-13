'use client'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Star, Sparkles, Youtube, Twitter, Linkedin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for testing with real content',
    features: [
      '100 AI requests per month',
      'YouTube URL → Transcript',
      '10 summary modes',
      'AI Chat for creators',
      '1 Brand Voice',
      '3 Remix formats',
      'Export to Markdown',
      'Email support',
    ],
    cta: 'Start Free',
    popular: false,
    tier: 'free' as const,
    gradient: 'from-gray-500 to-gray-700',
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'month',
    description: 'For creators who repurpose content daily',
    features: [
      '1000 AI requests per month',
      'YouTube URL → Transcript',
      '10 summary modes',
      'AI Chat for creators',
      '3 Brand Voices',
      'All 10 Remix formats',
      'Content Remix Studio',
      'Export to Markdown',
      'Priority support',
      'Priority processing',
      'Early access to features',
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
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (tier: 'free' | 'pro') => {
    if (!user) {
      router.push(`/sign-up?redirect=/pricing`)
      return
    }

    if (tier === 'free') {
      router.push('/dashboard')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to start checkout',
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black/50"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Simple Pricing for Creators
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Start free with 100 requests/month. Upgrade when you're ready to scale.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15 }}
              >
                <Card
                  className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] border w-full flex flex-col transition-all hover:scale-[1.02] ${
                    plan.popular
                      ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-4 py-1.5">
                        <Star className="h-3 w-3 mr-1.5 fill-white" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 pt-8">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                    <div className="mt-3 mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    </div>
                    <CardDescription className="text-gray-400">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <div className={`mt-0.5 rounded-full p-1 bg-gradient-to-br ${plan.gradient}`}>
                            <Check className="h-3 w-3 text-white stroke-[3]" />
                          </div>
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="lg"
                      className={`w-full font-bold py-5 rounded-xl ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105'
                          : 'bg-white text-black hover:bg-gray-100 hover:scale-105'
                      }`}
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={loading}
                    >
                      {loading && plan.tier === 'pro' ? 'Loading...' : plan.cta}
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-2">
                      {plan.tier === 'free' ? 'No credit card required' : '30-day money-back guarantee'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              What You Can Create
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Youtube className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">YouTube Content</h3>
                  <p className="text-sm text-gray-400">Video descriptions, timestamps, show notes</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                    <Twitter className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Twitter Threads</h3>
                  <p className="text-sm text-gray-400">10-tweet threads with hooks and CTAs</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Linkedin className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">LinkedIn Posts</h3>
                  <p className="text-sm text-gray-400">Professional posts with insights</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              FAQ
            </h2>
            <div className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">What counts as a request?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Each AI operation: summarization or chat message. Example: Fetching a YouTube transcript + summarizing it = 1 request.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Can I cancel anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Yes! Cancel anytime. You'll keep access until the end of your billing period, then move to the free plan.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Is 100 requests enough?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    100 requests = ~50 YouTube videos processed. Perfect for testing. Heavy users should upgrade to Pro for 1000 requests.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-20 text-center"
          >
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/10 p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Repurpose Content?
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Join creators who turn 1 video into 10 pieces of content
              </p>
              <Button onClick={() => router.push('/sign-up')} className="bg-white text-black hover:bg-white/90 px-8">
                Get Started Free
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
