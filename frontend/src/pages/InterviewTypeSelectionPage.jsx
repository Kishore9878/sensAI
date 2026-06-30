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
  Code,
  MessageSquare,
  Layers,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  TrendingUp,
  Users,
  Star,
  Brain,
  Check,
  ArrowRight
} from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';

const InterviewTypeSelectionPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSelect = (typeId) => {
    if (typeId === 'resume') {
      navigate('/interview/upload?mode=practice');
    } else if (typeId === 'core_subjects') {
      navigate('/interview/subject?mode=practice');
    } else {
      navigate(`/interview/practice/prep?type=${typeId}`);
    }
  };

  const interviewTypes = [
    {
      id: 'technical',
      name: 'Technical Interview',
      subtitle: 'Core Skills',
      description: 'Evaluate technical concepts, system architecture, programming paradigms, and debugging capabilities tailored directly to your target role and key skills.',
      icon: <Code className="w-5 h-5 text-blue-400" />,
      image: '/tech_interview_3d.png',
      tags: ['DSA & Algorithms', 'System Design', 'Coding Problems', 'Debugging'],
      theme: {
        glow: 'hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.18)]',
        border: 'hover:border-blue-500/30',
        badge: 'border-blue-500/30 bg-blue-950/20 text-blue-400',
        iconBg: 'bg-blue-950/25 border-blue-500/20 text-blue-400',
        tagBorder: 'border-blue-500/10 bg-blue-500/5 text-blue-400',
        btn: 'border-blue-500/20 bg-blue-950/5 text-blue-400 hover:bg-blue-600 hover:text-white',
        bullet: 'text-blue-500'
      }
    },
    {
      id: 'behavioral',
      name: 'Behavioral Interview',
      subtitle: 'Soft Skills',
      description: 'Practice scenarios testing leadership, teamwork, ownership, communication, and conflict resolution using professional STAR-style interview questions.',
      icon: <MessageSquare className="w-5 h-5 text-purple-400" />,
      image: '/behavioral_interview_3d.png',
      tags: ['STAR Framework', 'Leadership', 'Teamwork', 'Communication'],
      theme: {
        glow: 'hover:shadow-[0_20px_50px_-15px_rgba(168,85,247,0.18)]',
        border: 'hover:border-purple-500/30',
        badge: 'border-purple-500/30 bg-purple-950/20 text-purple-400',
        iconBg: 'bg-purple-950/25 border-purple-500/20 text-purple-400',
        tagBorder: 'border-purple-500/10 bg-purple-500/5 text-purple-400',
        btn: 'border-purple-500/20 bg-purple-950/5 text-purple-400 hover:bg-purple-600 hover:text-white',
        bullet: 'text-purple-500'
      }
    },
    {
      id: 'system_design',
      name: 'System Design Interview',
      subtitle: 'Design Thinking',
      description: 'Assess your design capability for scalable distributed systems, databases, caching layers, load balancing, performance optimization, and security concerns.',
      icon: <Layers className="w-5 h-5 text-green-400" />,
      image: '/system_design_interview_3d.png',
      tags: ['Scalability', 'High Availability', 'Databases', 'Security'],
      theme: {
        glow: 'hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.18)]',
        border: 'hover:border-green-500/30',
        badge: 'border-green-500/30 bg-green-950/20 text-green-400',
        iconBg: 'bg-green-950/25 border-green-500/20 text-green-400',
        tagBorder: 'border-green-500/10 bg-green-500/5 text-green-400',
        btn: 'border-green-500/20 bg-green-950/5 text-green-400 hover:bg-green-600 hover:text-white',
        bullet: 'text-green-500'
      }
    },
    {
      id: 'hr',
      name: 'HR Interview',
      subtitle: 'People & Culture',
      description: 'Prepare for HR assessments evaluating organizational fit, communication styles, situational integrity, values alignment, and career motivations.',
      icon: <User className="w-5 h-5 text-orange-400" />,
      image: '/hr_interview_3d.png',
      tags: ['Culture Fit', 'Situational Qs', 'Values', 'Career Goals'],
      theme: {
        glow: 'hover:shadow-[0_20px_50px_-15px_rgba(249,115,22,0.18)]',
        border: 'hover:border-orange-500/30',
        badge: 'border-orange-500/30 bg-orange-950/20 text-orange-400',
        iconBg: 'bg-orange-950/25 border-orange-500/20 text-orange-400',
        tagBorder: 'border-orange-500/10 bg-orange-500/5 text-orange-400',
        btn: 'border-orange-500/20 bg-orange-950/5 text-orange-400 hover:bg-orange-600 hover:text-white',
        bullet: 'text-orange-500'
      }
    },
    {
      id: 'resume',
      name: 'Resume-Based Interview',
      subtitle: 'Personalized',
      description: 'Engage in an interview customized entirely to your uploaded resume, detailing your specific projects, technologies used, experiences, and achievements.',
      icon: <FileText className="w-5 h-5 text-sky-400" />,
      image: '/resume_interview_3d.png',
      tags: ['Resume Analysis', 'Projects', 'Experience', 'Skills'],
      theme: {
        glow: 'hover:shadow-[0_20px_50px_-15px_rgba(14,165,233,0.18)]',
        border: 'hover:border-sky-500/30',
        badge: 'border-sky-500/30 bg-sky-950/20 text-sky-400',
        iconBg: 'bg-sky-950/25 border-sky-500/20 text-sky-400',
        tagBorder: 'border-sky-500/10 bg-sky-500/5 text-sky-400',
        btn: 'border-sky-500/20 bg-sky-950/5 text-sky-400 hover:bg-sky-600 hover:text-white',
        bullet: 'text-sky-500'
      }
    },
    {
      id: 'core_subjects',
      name: 'Core Subjects Interview',
      subtitle: 'Fundamentals',
      description: 'Test your fundamental knowledge of computer science core subjects: Object Oriented Programming, DBMS, Operating Systems, and Computer Networks.',
      icon: <GraduationCap className="w-5 h-5 text-pink-400" />,
      image: '/subjects_interview_3d.png',
      tags: ['OOPs', 'DBMS', 'Operating Systems', 'Networks'],
      theme: {
        glow: 'hover:shadow-[0_20px_50px_-15px_rgba(236,72,153,0.18)]',
        border: 'hover:border-pink-500/30',
        badge: 'border-pink-500/30 bg-pink-950/20 text-pink-400',
        iconBg: 'bg-pink-950/25 border-pink-500/20 text-pink-400',
        tagBorder: 'border-pink-500/10 bg-pink-500/5 text-pink-400',
        btn: 'border-pink-500/20 bg-pink-950/5 text-pink-400 hover:bg-pink-600 hover:text-white',
        bullet: 'text-pink-500'
      }
    }
  ];

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
      <main className="flex-1 container mx-auto px-6 py-8 relative z-10 space-y-8">
        
        {/* Back Link */}
        <div>
          <Link
            to="/interview"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Mode Selection</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
            Select Practice Category
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Choose the specific interview assessment style you want to practice. The AI interviewer will generate questions and feedback matching your selection.
          </p>
        </div>

        {/* 6 Cards Grid (3 Columns on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {interviewTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleSelect(type.id)}
              className={`p-6 rounded-2xl border border-neutral-900 bg-gradient-to-b from-[#09090b] to-[#040405] transition-all duration-300 flex flex-col justify-between min-h-[340px] group cursor-pointer relative overflow-hidden ${type.theme.glow} ${type.theme.border} hover:-translate-y-1`}
            >
              
              {/* Header Title Section */}
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${type.theme.iconBg}`}>
                  {type.icon}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[15px] font-bold text-white group-hover:text-blue-500 transition-colors duration-200">
                    {type.name}
                  </h3>
                  <span className={`inline-block text-[8px] border px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${type.theme.badge}`}>
                    {type.subtitle}
                  </span>
                </div>
              </div>

              {/* Mid Body Row (Description + 3D Render) */}
              <div className="flex items-center justify-between gap-4 mt-3">
                <p className="text-xs text-neutral-400 leading-relaxed font-normal flex-1">
                  {type.description}
                </p>
                <div className="w-24 h-24 shrink-0 relative flex items-center justify-center">
                  <img 
                    src={type.image} 
                    alt={type.name} 
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.65)] transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {type.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className={`text-[9px] font-bold border rounded-md px-2 py-0.5 ${type.theme.tagBorder}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bottom Divider & Action Button */}
              <div className="pt-4 mt-4 border-t border-neutral-900/60">
                <button
                  onClick={(e) => { e.stopPropagation(); handleSelect(type.id); }}
                  className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-all duration-300 ${type.theme.btn}`}
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#07070a]/60 backdrop-blur-md border border-neutral-900/60 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-12 shadow-sm">
          <div className="flex items-center gap-3.5 self-start md:self-auto">
            <div className="w-9 h-9 rounded-lg bg-blue-950/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-blue-400">AI-Powered Interviewer</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Get real-time feedback, detailed analysis, and personalized improvement tips to ace your interviews.</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 self-start md:self-auto">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-300">
              <div className="w-4 h-4 rounded-full bg-green-950/20 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <Check className="w-2.5 h-2.5 text-green-400" />
              </div>
              <span>Instant Feedback</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-300">
              <div className="w-4 h-4 rounded-full bg-green-950/20 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <Check className="w-2.5 h-2.5 text-green-400" />
              </div>
              <span>Detailed Analysis</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-300">
              <div className="w-4 h-4 rounded-full bg-green-950/20 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <Check className="w-2.5 h-2.5 text-green-400" />
              </div>
              <span>Smart Recommendations</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-300">
              <div className="w-4 h-4 rounded-full bg-green-950/20 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <Check className="w-2.5 h-2.5 text-green-400" />
              </div>
              <span>Track Progress</span>
            </div>
          </div>
        </div>

      </main>

      {/* Global Profile Modal Component */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

    </div>
  );
};

export default InterviewTypeSelectionPage;
