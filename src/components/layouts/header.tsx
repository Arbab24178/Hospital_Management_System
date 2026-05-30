"use client"

import { Menu, Bell } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
  userName: string
  userRole: string
}

export function Header({ onMenuClick, userName, userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu size={24} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 group">
          <Bell size={20} className="group-hover:animate-bell-ring" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse-soft" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
