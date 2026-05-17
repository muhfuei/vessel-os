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
} from 'lucide-react'
import type { SessionUser } from '@/lib/auth'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/vessels',    label: 'Vessels',      icon: Ship },
  { href: '/tasks',      label: 'Maintenance',  icon: Wrench },
  { href: '/defects',    label: 'Defects',      icon: AlertTriangle },
  { href: '/reports',    label: 'Reports',      icon: FileText },
  { href: '/documents',  label: 'Documents',    icon: FolderOpen },
  { href: '/users',      label: 'Users',        icon: Users, adminOnly: true },
]

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-slate-900 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-500/20 ring-1 ring-sky-500/30 flex-shrink-0">
            <Anchor className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-white leading-tight">Vessel OS</p>
            <p className="text-slate-500 text-xs">Operational System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, adminOnly }) => {
            if (adminOnly && user.role !== 'ADMIN') return null
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-sky-400' : '')} />
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-1">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
              {user.role}
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav — min 44px touch targets */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon, adminOnly }) => {
          if (adminOnly && user.role !== 'ADMIN') return null
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-xs transition-colors duration-150',
                active ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
