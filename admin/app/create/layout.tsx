import { Sidebar } from '@/components/sidebar'

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}

