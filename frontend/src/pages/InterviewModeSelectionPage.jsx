import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Sparkles, 
  LayoutGrid, 
  ChevronDown, 
  User, 
  LogOut, 
  FileText,
  HelpCircle,
  Mic,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';

const InterviewModeSelectionPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
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
                      <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
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
      <main className="flex-1 container mx-auto px-6 py-12 relative z-10 flex flex-col justify-center max-w-7xl">
        
        {/* Header Title */}
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Interview Prep Mode
          </h1>
          <p className="text-sm text-neutral-550 max-w-2xl mx-auto leading-relaxed">
            Choose your preferred training ground. Build your fundamental knowledge with MCQ quizzes or experience a full-length, interactive AI mock interview.
          </p>
        </div>

        {/* 2 Large Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full pt-4">
          
          {/* Practice Mode (MCQ) */}
          <div 
            onClick={() => navigate('/interview/practice')}
            className="p-8 rounded-2xl border border-neutral-900 bg-[#09090b] hover:border-neutral-800 hover:bg-[#0c0c0f] active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between h-[420px] group relative overflow-hidden shadow-2xl"
          >
            {/* Ambient Background Glow on hover */}
            <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            <div className="space-y-6 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-white group-hover:text-indigo-450 transition-colors duration-300">
                  Practice Mode (MCQ)
                </h3>
                <p className="text-xs text-neutral-450 leading-relaxed font-medium">
                  Practice interview questions in MCQ format with instant evaluation, explanations, analytics, and performance tracking. Perfect for strengthening concepts quickly before interviews.
                </p>
              </div>
              
              {/* Features List */}
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                {['Multiple Choice Questions', 'Instant Scoring', 'Explanations', 'Accuracy Tracking', 'Performance Analytics'].map((feature, idx) => (
                  <li key={idx} className="text-[10px] text-neutral-500 font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between border-t border-neutral-900/50">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/interview/practice'); }}
                className="bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition-all duration-300 flex items-center gap-1.5 group-hover:border-indigo-500/30"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Mock Interview (AI) */}
          <div 
            onClick={() => navigate('/interview/mock')}
            className="p-8 rounded-2xl border border-neutral-900 bg-[#09090b] hover:border-neutral-800 hover:bg-[#0c0c0f] active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between h-[420px] group relative overflow-hidden shadow-2xl"
          >
            {/* Ambient Background Glow on hover */}
            <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

            <div className="space-y-6 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                <Mic className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-450 transition-colors duration-300">
                  Mock Interview (AI)
                </h3>
                <p className="text-xs text-neutral-450 leading-relaxed font-medium">
                  Experience a realistic AI-powered interview with descriptive questions. Answer using voice or text and receive detailed AI feedback, communication analysis, and interview performance evaluation.
                </p>
              </div>

              {/* Features List */}
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                {['AI Generated Questions', 'Voice & Text Responses', 'Real Interview Simulation', 'Personalized Feedback', 'AI Performance Analysis'].map((feature, idx) => (
                  <li key={idx} className="text-[10px] text-neutral-500 font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between border-t border-neutral-900/50">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/interview/mock'); }}
                className="bg-white hover:bg-neutral-100 text-black font-bold py-2.5 px-5 rounded-lg text-xs transition-all duration-300 flex items-center gap-1.5"
              >
                <span>Start Mock Interview</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Global Profile Modal Component */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

    </div>
  );
};

export default InterviewModeSelectionPage;
