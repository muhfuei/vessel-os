'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import {
  Anchor,
  LayoutDashboard,
  Ship,
  Wrench,
  AlertTriangle,
  FileText,
  FolderOpen,
  Users,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import type { SessionUser } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vessels', label: 'Vessels', icon: Ship },
  { href: '/tasks', label: 'Maintenance', icon: Wrench },
  { href: '/defects', label: 'Defects', icon: AlertTriangle },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/users', label: 'Users', icon: Users, adminOnly: true },
]

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-slate-900 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 flex-shrink-0">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Vessel OS</p>
            <p className="text-slate-400 text-xs">Operational System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, adminOnly }) => {
            if (adminOnly && user.role !== 'ADMIN') return null
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-1">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-blue-900 text-blue-200">
              {user.role}
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 flex">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon, adminOnly }) => {
          if (adminOnly && user.role !== 'ADMIN') return null
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
                active ? 'text-blue-400' : 'text-slate-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
