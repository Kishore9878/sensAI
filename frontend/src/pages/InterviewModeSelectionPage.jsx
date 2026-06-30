import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Sparkles, 
  LayoutGrid, 
  ChevronDown, 
  User, 
  LogOut, 
  FileText,
  Mic,
  ArrowRight,
  GraduationCap,
  Check,
  Zap,
  BookOpen,
  BarChart3,
  Brain,
  Target,
  MessageSquare,
  Star,
  ArrowLeft,
  TrendingUp,
  Users,
  Volume2
} from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';

const InterviewModeSelectionPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking red recording dot animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050508] text-foreground flex flex-col font-sans selection:bg-blue-500/20 relative">
      
      {/* Grid Pattern Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e0e16_1px,transparent_1px),linear-gradient(to_bottom,#0e0e16_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-45"></div>

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo SENSAi */}
          <Link to="/" className="font-sans tracking-tight text-white select-none text-xl font-extrabold">
            SENS<span>A</span><span className="text-blue-500 lowercase">i</span>
          </Link>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="bg-neutral-950 border border-neutral-900 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Industry Insights</span>
            </Link>

            <div className="relative">
              <button 
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="bg-white hover:bg-neutral-150 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Growth Tools</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>
              
              {toolsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-955 border border-neutral-900 rounded-lg shadow-xl py-1 z-50">
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
                className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden hover:border-neutral-600 transition-all duration-200 text-xs font-bold text-white uppercase select-none"
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
                <div className="absolute right-0 mt-2 w-56 bg-neutral-955 border border-neutral-900 rounded-lg shadow-xl py-1 z-50">
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
                    <User className="w-3.5 h-3.5 animate-pulse text-blue-400" />
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
      <main className="flex-1 container mx-auto px-6 py-12 relative z-10 flex flex-col justify-center max-w-7xl space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-3 relative">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
            Choose Your Interview Practice
          </h1>
          <p className="text-xs text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Select the mode that best fits your goals and start improving today.
          </p>
        </div>

        {/* 2 Massive Interactive Pathway Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
          
          {/* LEFT CARD: Practice Mode (MCQ) */}
          <div 
            onClick={() => navigate('/interview/practice')}
            className="rounded-[24px] border border-neutral-900 bg-gradient-to-b from-[#09090b] to-[#040405] hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.15)] p-6 md:p-8 relative"
          >
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Header Details */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.12)] shrink-0 mt-0.5">
                  <GraduationCap className="w-7 h-7 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[19px] font-extrabold text-white group-hover:text-blue-450 transition-colors duration-250">
                      Practice Mode <span className="text-blue-400">(MCQ)</span>
                    </h3>
                  </div>
                  <span className="inline-block text-[8px] border border-blue-500/30 bg-blue-950/25 text-blue-450 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                    ✦ MCQ Based Practice
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-normal max-w-xs pt-1">
                    Practice interview questions in MCQ format with instant evaluation, explanations, and performance analytics.
                  </p>
                </div>
              </div>

              {/* 3D Render Image */}
              <div className="w-28 h-28 shrink-0 relative flex items-center justify-center select-none">
                <img 
                  src="/practice_mode.png" 
                  alt="Practice Mode 3D" 
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Interactive MCQ Simulator Screen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#050508]/90 border border-neutral-900 p-4 rounded-2xl shadow-inner">
              
              {/* Simulator Left Section: Question Selection */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[8px] font-extrabold text-neutral-500 uppercase tracking-widest border-b border-neutral-900 pb-1.5">
                    <span className="text-blue-400">Data Structures • <span className="text-neutral-550">Question 24/50</span></span>
                    <span>80%</span>
                  </div>
                  <p className="text-[10.5px] text-white font-bold leading-relaxed mt-2">
                    Which data structure uses the Last-In-First-Out (LIFO) principle?
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[9px] text-left px-2.5 py-1.5 border border-neutral-900 bg-neutral-950/40 text-neutral-400 rounded-lg">
                    A. Queue
                  </div>
                  <div className="text-[9px] text-left px-2.5 py-1.5 border border-neutral-900 bg-neutral-950/40 text-neutral-400 rounded-lg">
                    B. Linked List
                  </div>
                  <div className="text-[9px] text-left px-2.5 py-1.5 border border-blue-500/30 bg-blue-950/30 text-blue-400 font-extrabold rounded-lg flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    C. Stack
                  </div>
                  <div className="text-[9px] text-left px-2.5 py-1.5 border border-neutral-900 bg-neutral-950/40 text-neutral-400 rounded-lg">
                    D. Tree
                  </div>
                </div>
              </div>

              {/* Simulator Right Section: Score Ring */}
              <div className="border-t md:border-t-0 md:border-l border-neutral-900 pt-4 md:pt-0 md:pl-4 flex flex-col justify-between space-y-4">
                <div className="text-[8px] font-extrabold text-neutral-550 uppercase tracking-wider">
                  Session Performance
                </div>

                <div className="flex items-center gap-4 py-2">
                  {/* Accuracy Circular Progress */}
                  <div className="w-20 h-20 shrink-0 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-900"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-500"
                        strokeDasharray="68, 100"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-[12px] font-extrabold text-white leading-none">68%</div>
                      <div className="text-[6.5px] text-neutral-500 font-bold uppercase mt-0.5 leading-none">Accuracy</div>
                    </div>
                  </div>

                  {/* Tiny details grid */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-white leading-none">34 / 50</div>
                        <div className="text-[6px] text-neutral-550 uppercase font-bold tracking-wider">Attempted</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-white leading-none">12,450</div>
                        <div className="text-[6px] text-neutral-550 uppercase font-bold tracking-wider">Questions Solved</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom stats row */}
                <div className="grid grid-cols-2 gap-2 border-t border-neutral-900/60 pt-2.5">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-[9px] font-extrabold text-white leading-none">88%</div>
                      <div className="text-[6px] text-neutral-550 uppercase font-bold mt-0.5 leading-none">Avg. Accuracy</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-blue-450 shrink-0" />
                    <div>
                      <div className="text-[9px] font-extrabold text-white leading-none">34:12</div>
                      <div className="text-[6px] text-neutral-550 uppercase font-bold mt-0.5 leading-none">Time Spent</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* MCQ Feature list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-900 bg-[#07070a]/40">
                <Zap className="w-4 h-4 text-blue-450 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold text-white truncate">Instant Feedback</div>
                  <div className="text-[7.5px] text-neutral-500 truncate mt-0.5">Get explanations instantly</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-900 bg-[#07070a]/40">
                <BarChart3 className="w-4 h-4 text-blue-450 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold text-white truncate">Performance Analytics</div>
                  <div className="text-[7.5px] text-neutral-500 truncate mt-0.5">Track accuracy and improvement</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-900 bg-[#07070a]/40">
                <Brain className="w-4 h-4 text-blue-450 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold text-white truncate">Adaptive Difficulty</div>
                  <div className="text-[7.5px] text-neutral-500 truncate mt-0.5">Questions adapt to skill level</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-900 bg-[#07070a]/40">
                <Target className="w-4 h-4 text-blue-450 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold text-white truncate">Topic-wise Practice</div>
                  <div className="text-[7.5px] text-neutral-500 truncate mt-0.5">Focus on weak topics & improve</div>
                </div>
              </div>
            </div>

            {/* MCQ Difficulty selection pills */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-extrabold">Difficulty Levels</div>
              <div className="flex flex-wrap gap-2">
                <span className="border border-green-500/20 bg-green-500/5 text-green-400 text-[9px] px-2.5 py-0.5 rounded font-extrabold">Easy</span>
                <span className="border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-[9px] px-2.5 py-0.5 rounded font-extrabold">Medium</span>
                <span className="border border-red-500/20 bg-red-500/5 text-red-400 text-[9px] px-2.5 py-0.5 rounded font-extrabold">Hard</span>
                <span className="border border-blue-500/20 bg-blue-500/5 text-blue-450 text-[9px] px-2.5 py-0.5 rounded font-extrabold">Adaptive</span>
              </div>
            </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 border-t border-neutral-900/60 mt-6 w-full">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/interview/practice'); }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-5 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.45)] hover:shadow-[0_4px_24px_rgba(37,99,235,0.6)] active:scale-[0.99] group-hover:bg-blue-550"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

          </div>

          {/* RIGHT CARD: Mock Interview (AI) */}
          <div 
            onClick={() => navigate('/interview/mock')}
            className="rounded-[24px] border border-neutral-900 bg-gradient-to-b from-[#09090b] to-[#040405] hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_-15px_rgba(168,85,247,0.15)] p-6 md:p-8 relative"
          >
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Header Details */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.12)] shrink-0 mt-0.5">
                  <Mic className="w-7 h-7 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[19px] font-extrabold text-white group-hover:text-purple-450 transition-colors duration-250">
                      Mock Interview <span className="text-purple-400">(AI)</span>
                    </h3>
                  </div>
                  <span className="inline-block text-[8px] border border-purple-500/30 bg-purple-950/25 text-purple-450 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                    ✦ AI Powered Interview
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-normal max-w-xs pt-1">
                    Experience real AI interviews with voice/text responses and detailed performance feedback.
                  </p>
                </div>
              </div>

              {/* 3D Render Image */}
              <div className="w-28 h-28 shrink-0 relative flex items-center justify-center select-none">
                <img 
                  src="/mock_interview.png" 
                  alt="Mock Interview 3D" 
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Interactive Audio Simulator Screen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#050508]/90 border border-neutral-900 p-4 rounded-2xl shadow-inner">
              
              {/* Section 1: AI Feedback preview */}
              <div className="space-y-2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-900 pb-3 md:pb-0 md:pr-3">
                <div className="text-[8px] font-extrabold text-purple-400 uppercase tracking-widest">
                  AI Feedback Preview
                </div>
                
                <div className="space-y-1.5 my-1">
                  <div className="flex items-start gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <MessageSquare className="w-2 h-2" />
                    </div>
                    <span className="text-[8px] text-neutral-350 leading-tight">Good articulation, but pace is slightly slow.</span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Zap className="w-2 h-2" />
                    </div>
                    <span className="text-[8px] text-neutral-350 leading-tight">Strong technical knowledge.</span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Star className="w-2 h-2" />
                    </div>
                    <span className="text-[8px] text-neutral-350 leading-tight">Improve clarity in explaining concepts.</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-neutral-900/60">
                  <div className="flex justify-between text-[7px] font-bold text-neutral-500 mb-1">
                    <span>Overall Score</span>
                    <span className="text-white">85/100</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-550 h-full rounded-full w-[85%]"></div>
                  </div>
                </div>
              </div>

              {/* Section 2: Mock Session Wave Ring */}
              <div className="flex flex-col items-center justify-center py-2 space-y-2 border-b md:border-b-0 md:border-r border-neutral-900 pb-3 md:pb-0 md:px-2">
                <div className="w-18 h-18 rounded-full border border-purple-500/20 flex items-center justify-center relative p-1.5">
                  
                  {/* Concentric dotted soundwave indicators */}
                  <div className="absolute inset-0.5 rounded-full border border-dashed border-purple-500/35 animate-spin duration-7000"></div>
                  <div className="absolute inset-2 rounded-full border border-dashed border-pink-500/15 animate-spin duration-10000"></div>

                  <div className="w-full h-full rounded-full bg-purple-950/20 border border-purple-500/20 flex flex-col items-center justify-center text-center p-1 z-15">
                    <div className="text-[5.5px] text-purple-400 font-extrabold uppercase tracking-wide leading-none">Mock Interview</div>
                    <div className="text-[5px] text-neutral-550 font-bold uppercase mt-0.5 leading-none">Session</div>
                    <div className="text-[4.5px] text-pink-400 font-bold mt-1 leading-none">Active Speaking</div>
                    <Mic className="w-2 h-2 text-purple-400 mt-1" />
                  </div>
                </div>
                <div className="text-[7.5px] text-neutral-550 font-bold tracking-wider mt-1 bg-neutral-950/60 border border-neutral-900 px-2 py-0.5 rounded-full">
                  04:28 / 10:00
                </div>
              </div>

              {/* Section 3: Recording Status */}
              <div className="flex flex-col justify-between items-center py-1.5 space-y-3">
                <div className="text-[8px] font-extrabold text-neutral-550 uppercase tracking-widest">
                  On Air
                </div>

                {/* Animated sound waves */}
                <div className="flex items-center gap-1.5 h-10">
                  <div className="w-0.5 bg-purple-500 rounded-full animate-pulse h-6"></div>
                  <div className="w-0.5 bg-pink-500 rounded-full animate-pulse h-9"></div>
                  <div className="w-0.5 bg-purple-450 rounded-full animate-pulse h-5"></div>
                  <div className="w-0.5 bg-purple-500 rounded-full animate-pulse h-8 animate-delay-150"></div>
                  <Mic className="w-5 h-5 text-purple-400 mx-1 shrink-0" />
                  <div className="w-0.5 bg-purple-500 rounded-full animate-pulse h-8 animate-delay-300"></div>
                  <div className="w-0.5 bg-pink-500 rounded-full animate-pulse h-5"></div>
                  <div className="w-0.5 bg-purple-450 rounded-full animate-pulse h-9"></div>
                  <div className="w-0.5 bg-purple-500 rounded-full animate-pulse h-6"></div>
                </div>

                <div className="space-y-1 text-center">
                  <div className="flex items-center gap-1 text-[7.5px] font-extrabold text-neutral-400 justify-center">
                    <span className={`w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 ${blink ? 'opacity-100' : 'opacity-30'} transition-opacity duration-350`}></span>
                    <span>Recording...</span>
                  </div>
                  <div className="text-[7.5px] text-neutral-550 font-bold">04:28 / 10:00</div>
                </div>
              </div>

            </div>

            {/* AI Feature list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-900 bg-[#07070a]/40">
                <MessageSquare className="w-4 h-4 text-purple-450 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold text-white truncate">AI Generated Questions</div>
                  <div className="text-[7.5px] text-neutral-500 truncate mt-0.5">Dynamic questions based on profile</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-900 bg-[#07070a]/40">
                <Mic className="w-4 h-4 text-purple-450 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold text-white truncate">Voice & Text Responses</div>
                  <div className="text-[7.5px] text-neutral-500 truncate mt-0.5">Answer using voice or type responses</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-900 bg-[#07070a]/40">
                <BarChart3 className="w-4 h-4 text-purple-450 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold text-white truncate">Detailed Feedback</div>
                  <div className="text-[7.5px] text-neutral-500 truncate mt-0.5">Get scores & improvement suggestions</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-900 bg-[#07070a]/40">
                <Star className="w-4 h-4 text-purple-450 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold text-white truncate">Real Interview Simulation</div>
                  <div className="text-[7.5px] text-neutral-500 truncate mt-0.5">Simulate actual recruiter interview</div>
                </div>
              </div>
            </div>

            {/* AI Types list pills */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-extrabold">Interview Types</div>
              <div className="flex flex-wrap gap-2">
                <span className="border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[9px] px-2.5 py-0.5 rounded font-extrabold">Technical</span>
                <span className="border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[9px] px-2.5 py-0.5 rounded font-extrabold">Behavioural</span>
                <span className="border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[9px] px-2.5 py-0.5 rounded font-extrabold">System Design</span>
                <span className="border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[9px] px-2.5 py-0.5 rounded font-extrabold">General</span>
                <span className="border border-pink-500/20 bg-pink-500/5 text-pink-400 text-[9px] px-2.5 py-0.5 rounded font-extrabold">+2 More</span>
              </div>
            </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 border-t border-neutral-900/60 mt-6 w-full">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/interview/mock'); }}
                className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold py-3.5 px-5 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_4px_20px_-4px_rgba(168,85,247,0.45)] hover:shadow-[0_4px_24px_rgba(168,85,247,0.6)] active:scale-[0.99]"
              >
                <span>Start Mock Interview</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
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
