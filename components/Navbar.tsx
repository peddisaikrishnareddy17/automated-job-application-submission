'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const links = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'Find Jobs', href: '/dashboard/jobs', icon: '🔍' },
    { name: 'Applications', href: '/dashboard/applications', icon: '📝' },
    { name: 'My Resumes', href: '/dashboard/resume', icon: '📄' },
    { name: 'Preferences', href: '/dashboard/preferences', icon: '⚙️' },
  ];

  return (
    <nav className="w-64 bg-white/5 border-r border-white/10 flex flex-col min-h-screen sticky top-0">
      <div className="p-8 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        JobFlow AI
      </div>

      <div className="flex-1 px-4 space-y-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${pathname === link.href ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <span>{link.icon}</span>
            <span className="font-medium">{link.name}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
