'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import ChangePasswordModal from '@/components/ChangePasswordModal'

export default function ChangePasswordButton() {
  const [show, setShow] = useState(false)

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
      >
        <KeyRound className="w-4 h-4" />
        Change Password
      </button>
      {show && <ChangePasswordModal onClose={() => setShow(false)} />}
    </>
  )
}
