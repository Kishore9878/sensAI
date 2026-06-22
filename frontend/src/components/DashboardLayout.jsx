import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProfileModal } from './ProfileModal';
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  Mail, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Resume Builder', path: '/resume', icon: FileText },
    { name: 'AI Cover Letter', path: '/cover-letter', icon: Mail },
    { name: 'AI Interview Prep', path: '/interview', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-card/60 border-b border-border h-16 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>SensAI</span>
        </Link>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 border border-border rounded text-muted-foreground hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card/40 backdrop-blur flex flex-col justify-between transform transition-transform duration-200 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col">
          {/* Logo */}
          <div className="h-16 px-6 border-b border-border flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-white">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span>SensAI</span>
            </Link>
            <button className="md:hidden text-muted-foreground hover:text-white" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.path;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${active 
                      ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-sm' 
                      : 'border border-transparent text-muted-foreground hover:bg-muted hover:text-white'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile Summary & Logout */}
        <div className="p-4 border-t border-border space-y-2">
          {user && (
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 border border-border bg-black/30 hover:bg-black/50 hover:border-indigo-500/40 rounded-lg text-left transition-all duration-200 cursor-pointer"
            >
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border border-indigo-500/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 text-sm uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border border-transparent text-muted-foreground hover:bg-destructive/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10 relative">
        {children}
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
