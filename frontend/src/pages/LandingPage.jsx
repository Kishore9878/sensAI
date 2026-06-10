import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Sparkles, 
  LayoutGrid, 
  ChevronDown, 
  BrainCircuit, 
  Briefcase, 
  TrendingUp, 
  FileText, 
  UserPlus, 
  FileEdit, 
  UserCheck, 
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  
  // Scroll position for 3D image tilt
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const rotateXVal = 15 - Math.min(scrollY / 550, 1) * 20; // 15deg down to -5deg
  const scaleVal = 0.96 + Math.min(scrollY / 550, 1) * 0.06; // 0.96 to 1.02

  // Dropdown states
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  
  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const faqData = [
    {
      q: "What makes Sensai unique as a career development tool?",
      a: "Sensai combines ATS optimization, cached industry metrics, and dynamic mock interview question grading in one cohesive, AI-powered coach tailored for software engineering and other major domains."
    },
    {
      q: "How does Sensai create tailored content?",
      a: "By leveraging the detailed onboarding parameters you complete, our platform prompt structures pass targeted experience, bio, and industry parameters directly to the Gemini API to format documents exactly how professional recruiters expect."
    },
    {
      q: "How accurate and up-to-date are Sensai's industry insights?",
      a: "Our system checks industry trends weekly and caches salary ranges, tech growth figures, and skills so that you are guaranteed access to highly reliable hiring expectations."
    },
    {
      q: "Is my data secure with Sensai?",
      a: "Yes. All profile history, generated cover letters, resume edits, and mock assessments are completely encrypted and securely stored in your personal account."
    },
    {
      q: "How can I track my interview preparation progress?",
      a: "Your mock session dashboard contains historical records of your previous Technical and Behavioral interviews, allowing you to track your scores and reread AI-graded improvement tips."
    },
    {
      q: "Can I edit the AI-generated content?",
      a: "Absolutely. The Resume Builder includes a live markdown editor that lets you review your ATS compliance suggestions and refine any copy before exporting."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col font-sans selection:bg-indigo-500/20">
      {/* Grid Pattern Overlay */}
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
            {/* Industry Insights Button */}
            <Link 
              to={user ? "/dashboard" : "/login"}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Industry Insights</span>
            </Link>

            {/* Growth Tools Dropdown */}
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
                    className="block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all"
                  >
                    AI Resume Builder
                  </Link>
                  <Link 
                    to="/cover-letter" 
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all"
                  >
                    AI Cover Letter
                  </Link>
                  <Link 
                    to="/interview" 
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all"
                  >
                    AI Interview Prep
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Avatar / Login CTA */}
            {user ? (
              <Link 
                to={user.profileCompleted ? "/dashboard" : "/onboarding"}
                className="w-8 h-8 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center overflow-hidden hover:opacity-85 transition-all"
              >
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <Link 
                to="/login"
                className="w-8 h-8 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center overflow-hidden hover:opacity-85 transition-all"
              >
                <div className="w-full h-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-bold">
                  S
                </div>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-12 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black">
        {/* Text and Actions */}
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-3xl mx-auto select-none">
            Your AI Career Coach for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
              Professional Success
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed font-medium">
            Advance your career with personalized guidance, interview prep, and AI-powered tools for job success.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link 
              to={user ? "/dashboard" : "/signup"}
              className="bg-white hover:bg-neutral-200 text-black px-6 py-2.5 rounded-md font-bold text-sm transition-all duration-200"
            >
              Get Started
            </Link>
            <Link 
              to="/login"
              className="border border-neutral-800 bg-neutral-950/40 hover:bg-neutral-900 text-neutral-300 px-6 py-2.5 rounded-md font-bold text-sm transition-all duration-200"
            >
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Banner Dashboard Image with 3D Scroll-driven Perspective Tilt - Expanded Width */}
        <div className="pt-12 w-full max-w-6xl mx-auto relative z-10" style={{ perspective: '1200px' }}>
          <div 
            style={{
              transform: `rotateX(${rotateXVal}deg) scale(${scaleVal})`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
            className="rounded-xl border border-neutral-800/80 bg-neutral-950/20 p-2 overflow-hidden shadow-2xl shadow-blue-500/5 backdrop-blur-md"
          >
            <img 
              src="/hero_banner.png" 
              alt="SensAI Dashboard Preview" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Powerful Features Section */}
      <section className="py-20 border-t border-neutral-900/60 bg-black relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Powerful Features for Your Career Growth
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Card 1: AI Career Guidance */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-neutral-950/30 flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
              <div className="space-y-4">
                <div className="text-neutral-400">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-base">AI-Powered Career Guidance</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  Get personalized career advice and insights powered by advanced AI technology.
                </p>
              </div>
            </div>

            {/* Card 2: Interview Prep */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-neutral-950/30 flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
              <div className="space-y-4">
                <div className="text-neutral-400">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-base">Interview Preparation</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  Practice with role-specific questions and get instant feedback to improve your performance.
                </p>
              </div>
            </div>

            {/* Card 3: Industry Insights */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-neutral-950/30 flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
              <div className="space-y-4">
                <div className="text-neutral-400">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-base">Industry Insights</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  Stay ahead with real-time industry trends, salary data, and market analysis.
                </p>
              </div>
            </div>

            {/* Card 4: Smart Resume */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-neutral-950/30 flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
              <div className="space-y-4">
                <div className="text-neutral-400">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-base">Smart Resume Creation</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  Generate ATS-optimized resumes with AI assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar Section */}
      <section className="border-t border-b border-neutral-800 bg-[#09090b]/80 py-16 relative z-10 overflow-hidden">
        {/* Stats Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1c24_1px,transparent_1px),linear-gradient(to_bottom,#1c1c24_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none opacity-40"></div>
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1.5">
              <div className="text-3xl sm:text-4xl font-black text-white">50+</div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-widest font-bold">Industries Covered</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-3xl sm:text-4xl font-black text-white">1000+</div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-widest font-bold">Interview Questions</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-3xl sm:text-4xl font-black text-white">95%</div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-widest font-bold">Success Rate</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-3xl sm:text-4xl font-black text-white">24/7</div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-widest font-bold">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-b border-neutral-900/60 bg-black relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">How It Works</h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">
              Four simple steps to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-200 mx-auto">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm">Professional Onboarding</h3>
                <p className="text-xs text-neutral-400 leading-relaxed px-4">
                  Share your industry and expertise for personalized guidance
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-200 mx-auto">
                <FileEdit className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm">Craft Your Documents</h3>
                <p className="text-xs text-neutral-400 leading-relaxed px-4">
                  Create ATS-optimized resumes and compelling cover letters
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-200 mx-auto">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm">Prepare for Interviews</h3>
                <p className="text-xs text-neutral-400 leading-relaxed px-4">
                  Practice with AI-powered mock interviews tailored to your role
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-200 mx-auto">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm">Track Your Progress</h3>
                <p className="text-xs text-neutral-400 leading-relaxed px-4">
                  Monitor improvements with detailed performance analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#09090b]/80 relative z-10 border-t border-b border-neutral-800 overflow-hidden">
        {/* Testimonials Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1c24_1px,transparent_1px),linear-gradient(to_bottom,#1c1c24_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none opacity-40"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">What Our Users Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-neutral-950/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" alt="Sarah" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah Chen</h4>
                  <p className="text-[10px] text-neutral-400">Software Engineer • Tech Giant Co.</p>
                </div>
              </div>
              <p className="text-xs text-neutral-300 italic leading-relaxed">
                "The AI-powered interview prep was a game-changer. Landed my dream job at a top tech company!"
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-neutral-950/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="Michael" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Michael Rodriguez</h4>
                  <p className="text-[10px] text-neutral-400">Product Manager • StartUp Inc.</p>
                </div>
              </div>
              <p className="text-xs text-neutral-300 italic leading-relaxed">
                "The industry insights helped me pivot my career successfully. The salary data was spot-on!"
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-neutral-950/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80" alt="Priya" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Priya Patel</h4>
                  <p className="text-[10px] text-neutral-400">Marketing Director • Global Corp</p>
                </div>
              </div>
              <p className="text-xs text-neutral-300 italic leading-relaxed">
                "My resume's ATS score improved significantly. Got more interviews in two weeks than in six months!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="py-24 bg-black relative z-10 border-b border-neutral-900/60">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="mt-12 space-y-1">
            {faqData.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="border-b border-neutral-800 overflow-hidden bg-transparent transition-all">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between py-5 text-left text-xs sm:text-sm font-semibold text-white hover:opacity-80 transition-all focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="pb-5 text-xs text-neutral-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section (Ready to Accelerate Your Career) */}
      <section className="py-20 bg-black relative z-10 px-6">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-neutral-400 via-neutral-100 to-neutral-400 text-black py-16 px-8 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 max-w-xl mx-auto font-medium">
              Join thousands of professionals who are advancing their careers with AI-powered guidance.
            </p>
            <div className="pt-2">
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="bg-neutral-950 hover:bg-neutral-900 text-white font-bold px-6 py-3 rounded-lg text-xs inline-flex items-center gap-2 transition-all shadow-md"
              >
                <span>Start Your Journey Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 bg-black relative z-10 text-center">
        <div className="container mx-auto px-6 space-y-4">
          <div className="text-xs text-neutral-500 font-medium">
            &copy; {new Date().getFullYear()} SensAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
