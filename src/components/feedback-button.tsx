'use client'

import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        variant: 'destructive',
        title: 'Feedback required',
        description: 'Please enter your feedback before submitting.',
      })
      return
    }

    setLoading(true)
    try {
      // Store feedback in Supabase
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          email: user?.email,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit feedback')

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
      })
      setFeedback('')
      setOpen(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="hidden md:flex fixed bottom-6 right-6 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white z-50"
          size="lg"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-white/10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Share Your Feedback</DialogTitle>
          <DialogDescription className="text-gray-400">
            Help us improve Clario! Your feedback shapes the future of this platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="feedback" className="text-white">
              What would you like to share?
            </Label>
            <Textarea
              id="feedback"
              placeholder="Feature requests, bug reports, or general feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-2 h-[150px] resize-none bg-black/50 border-white/20 text-white"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !feedback.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
