import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Anchor, Building2, LayoutDashboard, LogOut } from 'lucide-react'
import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth'

const NAV = [
  { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/super-admin/companies', label: 'Companies', icon: Building2 },
]

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  // Only SUPER_ADMIN can access this portal
  if (session.role !== 'SUPER_ADMIN') redirect('/dashboard')

  return (
    <div className="flex h-full bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 flex flex-col bg-slate-900 border-r border-slate-800 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 ring-1 ring-sky-500/30 flex items-center justify-center flex-shrink-0">
            <Anchor className="w-5 h-5 text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight">Vessel OS</p>
            <p className="text-sky-400 text-xs font-medium">Super Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom: user + sign out */}
        <div className="border-t border-slate-800 p-3 space-y-1">
          <div className="px-3 py-2">
            <p className="text-white text-sm font-medium truncate">{session.name}</p>
            <p className="text-slate-500 text-xs truncate">{session.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 overflow-auto bg-slate-950 min-h-full">
        {children}
      </main>
    </div>
  )
}
