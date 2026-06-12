import React from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar & Topbar placeholders */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <main className="p-6">{children}</main>
            </div>
        </div>
    )
}
