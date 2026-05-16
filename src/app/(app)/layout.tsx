import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex h-full">
      <Sidebar user={session} />
      <main className="flex-1 overflow-auto bg-gray-50 lg:ml-64">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  )
}
