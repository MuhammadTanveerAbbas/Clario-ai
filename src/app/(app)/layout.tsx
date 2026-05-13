import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppAppShell } from '@/components/layout/app-app-shell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return <AppAppShell>{children}</AppAppShell>
}
