"use client"

import { AuthGate } from "@/components/auth/auth-gate"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-[240px] transition-all duration-200">
          <Topbar />
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </AuthGate>
  )
}
