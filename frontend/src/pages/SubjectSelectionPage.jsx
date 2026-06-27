import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Sparkles, 
  LayoutGrid, 
  ChevronDown, 
  User, 
  LogOut, 
  FileText,
  Code,
  Database,
  Cpu,
  Globe,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';

const SubjectSelectionPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'practice'; // 'practice' or 'mock'

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const subjects = [
    {
      id: 'oop',
      name: 'Object Oriented Programming',
      description: 'Polymorphism, Inheritance, Encapsulation, Abstraction, Classes & Objects, Interfaces, and Design Patterns.',
      icon: <Code className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
    },
    {
      id: 'dbms',
      name: 'Database Management System',
      description: 'ACID properties, Database Normalization (1NF, 2NF, 3NF, BCNF), Indexing, Joins, Transactions, and Query Optimization.',
      icon: <Database className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
    },
    {
      id: 'os',
      name: 'Operating System',
      description: 'Process vs Thread, Cpu Scheduling, Deadlocks, Paging, Segmentation, Virtual Memory, and Semaphores.',
      icon: <Cpu className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
    },
    {
      id: 'cn',
      name: 'Computer Networks',
      description: 'OSI Model, TCP/IP Model, TCP three-way handshake, UDP, DNS, HTTP/HTTPS, Routing Protocols, and Subnetting.',
      icon: <Globe className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors" />
    }
  ];

  const handleSelect = (subjectName) => {
    const destination = mode === 'mock' 
      ? `/interview/mock/prep?type=core_subjects` 
      : `/interview/practice/prep?type=core_subjects`;
    
    navigate(destination, { state: { type: 'core_subjects', subject: subjectName } });
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col font-sans selection:bg-indigo-500/20 relative">
      
      {/* Grid Pattern Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121c_1px,transparent_1px),linear-gradient(to_bottom,#12121c_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40"></div>

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-black/80 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo SENSAi */}
          <Link to="/" className="font-sans tracking-tight text-white select-none text-xl font-extrabold">
            SENS<span>A</span><span className="text-blue-500 lowercase">i</span>
          </Link>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Industry Insights</span>
            </Link>

            <div className="relative">
              <button 
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="bg-white hover:bg-neutral-100 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Growth Tools</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>
              
              {toolsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-950 border border-neutral-800 rounded-lg shadow-xl py-1 z-50">
                  <Link 
                    to="/resume" 
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Build Resume
                  </Link>
                  <Link 
                    to="/cover-letter" 
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Cover Letter
                  </Link>
                  <Link 
                    to="/interview" 
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Interview Prep
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center overflow-hidden hover:border-neutral-500 transition-all duration-200 text-xs font-bold text-white uppercase select-none"
              >
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.charAt(0) || 'U'}</span>
                )}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-neutral-950 border border-neutral-800 rounded-lg shadow-xl py-1 z-50">
                  {user && (
                    <div className="px-4 py-2 border-b border-neutral-900">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-neutral-550 truncate">{user.email}</p>
                    </div>
                  )}
                  <button 
                    onClick={() => { setProfileDropdownOpen(false); setIsProfileOpen(true); }}
                    className="w-full text-left block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                    Complete Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-450 hover:bg-neutral-900 hover:text-red-300 transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-10 relative z-10 space-y-6 max-w-7xl">
        
        {/* Back Link */}
        <div>
          <Link
            to={mode === 'mock' ? '/interview/mock' : '/interview/practice'}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-white font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Categories</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Select Core Subject</h1>
          <p className="text-xs text-neutral-550 max-w-2xl font-medium">
            Select a computer science subject. The AI will customize a specialized suite of {mode === 'mock' ? 'descriptive interview questions' : 'MCQ practice quizzes'} based on core engineering theories.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleSelect(sub.name)}
              className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] hover:border-neutral-800 hover:bg-[#0c0c0f] active:scale-[0.99] text-left transition-all duration-250 focus:outline-none focus:ring-1 focus:ring-neutral-700 flex flex-col justify-between h-56 relative overflow-hidden group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-center text-neutral-450 group-hover:text-white transition-colors duration-200">
                  {sub.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors duration-200">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    {sub.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-500 group-hover:text-neutral-300 transition-colors duration-200">
                <span>Start Session</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

      </main>

      {/* Global Profile Modal Component */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

    </div>
  );
};

export default SubjectSelectionPage;
