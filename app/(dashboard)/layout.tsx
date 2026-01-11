import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
