import { useState } from 'react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { ToastContainer } from '../ui/Toast'

interface LayoutProps {
  children: ReactNode
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function Layout({ children, theme, onToggleTheme }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)

  const toggleSidebar = () => setIsSidebarMinimized((prev) => !prev)

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar escritorio */}
      <div 
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarMinimized ? 'w-20' : 'w-72'
        }`}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <Sidebar 
            isMinimized={isSidebarMinimized} 
            onToggleMinimize={toggleSidebar} 
          />
        </div>
      </div>

      {/* Overlay + Sidebar móvil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          {/* Panel */}
          <div className="animate-slide-left relative h-full w-72 shadow-2xl">
            <Sidebar onClose={() => setMobileMenuOpen(false)} isMobile />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out">
        <Topbar
          theme={theme}
          onToggleTheme={onToggleTheme}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Layout