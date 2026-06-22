import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { 
  Sparkles, 
  LayoutGrid, 
  ChevronDown, 
  TrendingUp, 
  Briefcase, 
  Info,
  Calendar,
  FileText,
  User,
  LogOut
} from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';

const defaultMockData = {
  marketOutlook: 'Positive',
  growthRate: 7.5,
  demandLevel: 'High',
  topSkills: ['Python', 'JavaScript', 'Cloud Computing', 'AWS', 'Agile'],
  keyTrends: [
    'AI/ML',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'Remote Work'
  ],
  recommendedSkills: ['Python', 'JavaScript', 'AWS', 'Docker', 'Kubernetes'],
  salaryRanges: [
    { role: 'Software Engineer', min: 80, median: 120, max: 155 },
    { role: 'Data Scientist', min: 90, median: 125, max: 160 },
    { role: 'Frontend Developer', min: 70, median: 105, max: 140 },
    { role: 'Backend Developer', min: 75, median: 110, max: 145 },
    { role: 'DevOps Engineer', min: 85, median: 130, max: 170 },
    { role: 'Mobile Developer', min: 72, median: 108, max: 142 }
  ]
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState(defaultMockData);
  const [loading, setLoading] = useState(true);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hoveredRole, setHoveredRole] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper to normalize salary to thousands (e.g., 90000 -> 90, 120 -> 120)
  const normalizeSalary = (val) => {
    if (!val) return 0;
    return val > 1000 ? val / 1000 : val;
  };

  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return '26/01/2025';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '26/01/2025';
    }
  };

  const getDaysUntilNextUpdate = (nextUpdateStr) => {
    if (!nextUpdateStr) return 'Next update in 6 days';
    try {
      const diffTime = new Date(nextUpdateStr) - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Update available now';
      return `Next update in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } catch (e) {
      return 'Next update in 6 days';
    }
  };

  // Fetch user profile and industry insights
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const profileRes = await axiosInstance.get('/profile');
        setProfile(profileRes.data);

        if (profileRes.data?.industry) {
          try {
            const insightsRes = await axiosInstance.get(`/insights/${profileRes.data.industry}`);
            if (insightsRes.data && Object.keys(insightsRes.data).length > 0) {
              setInsights({
                marketOutlook: insightsRes.data.marketOutlook || defaultMockData.marketOutlook,
                growthRate: insightsRes.data.growthRate !== undefined ? insightsRes.data.growthRate : defaultMockData.growthRate,
                demandLevel: insightsRes.data.demandLevel || defaultMockData.demandLevel,
                topSkills: insightsRes.data.topSkills?.length ? insightsRes.data.topSkills : defaultMockData.topSkills,
                keyTrends: insightsRes.data.keyTrends?.length ? insightsRes.data.keyTrends : defaultMockData.keyTrends,
                recommendedSkills: insightsRes.data.recommendedSkills?.length ? insightsRes.data.recommendedSkills : defaultMockData.recommendedSkills,
                salaryRanges: insightsRes.data.salaryRanges?.length ? insightsRes.data.salaryRanges : defaultMockData.salaryRanges,
                lastUpdated: insightsRes.data.lastUpdated,
                nextUpdate: insightsRes.data.nextUpdate
              });
            } else {
              setInsights(defaultMockData);
            }
          } catch (err) {
            console.error('Failed to load insights, falling back to mock:', err);
            setInsights(defaultMockData);
          }
        } else {
          setInsights(defaultMockData);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setInsights(defaultMockData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Find the absolute maximum salary value in the ranges to scale the chart dynamically
  const maxSalaryValue = insights?.salaryRanges?.reduce((max, range) => {
    const maxVal = normalizeSalary(range.max);
    return maxVal > max ? maxVal : max;
  }, 180) || 180;

  // Round up the max scale to the nearest multiple of 45 so grid lines align beautifully
  const chartMaxScale = Math.ceil(maxSalaryValue / 45) * 45;

  // Helper to clean up skill names by stripping long parentheses details if present
  const cleanSkillName = (name) => {
    if (!name) return '';
    return name.split('(')[0].trim();
  };

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

      {/* Main Insights Panel */}
      <main className="flex-1 container mx-auto px-6 py-10 relative z-10 space-y-6">
        
        {/* Title & Updated Badge */}
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Industry Insights</h1>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-850 text-[10px] text-neutral-400 font-medium">
            <Calendar className="w-3 h-3 text-neutral-500" />
            <span>Last updated: {formatLastUpdated(insights?.lastUpdated)}</span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Outlook */}
          <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold text-neutral-400">Market Outlook</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-extrabold text-white">{insights?.marketOutlook || 'Positive'}</div>
              <div className="text-[10px] text-neutral-500 font-medium">{getDaysUntilNextUpdate(insights?.nextUpdate)}</div>
            </div>
          </div>

          {/* Growth */}
          <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between h-32">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold text-neutral-400">Industry Growth</span>
              <TrendingUp className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-extrabold text-white">{(insights?.growthRate || 7.5)}%</div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>

          {/* Demand */}
          <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between h-32">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold text-neutral-400">Demand Level</span>
              <Briefcase className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-extrabold text-white">{insights?.demandLevel || 'High'}</div>
              <div className="w-full h-1 bg-emerald-500 rounded-full"></div>
            </div>
          </div>

          {/* Skills Badges */}
          <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between h-32 overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold text-neutral-400">Top Skills</span>
              <Info className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
              {insights?.topSkills?.slice(0, 5).map((skill, index) => (
                <span key={index} className="px-2 py-0.5 rounded-full border border-neutral-850 bg-black text-[10px] text-neutral-300 font-medium whitespace-nowrap">
                  {cleanSkillName(skill)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Bar Chart Section */}
        <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Salary Ranges by Role</h2>
            <p className="text-xs text-neutral-500 font-medium">
              Displaying minimum, median, and maximum salaries (in thousands)
            </p>
          </div>

          {/* Chart Wrapper with fixed height */}
          <div className="relative border border-neutral-900/60 rounded-xl bg-black/40 p-6 pt-10 pb-12">
            
            {/* Chart Area of fixed height */}
            <div className="relative h-[220px] ml-10">
              
              {/* Grid Lines */}
              <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                {[
                  chartMaxScale,
                  Math.round(chartMaxScale * 0.75),
                  Math.round(chartMaxScale * 0.50),
                  Math.round(chartMaxScale * 0.25),
                  0
                ].map((val, idx) => (
                  <div key={idx} className="w-full flex items-center gap-4 relative h-0">
                    <span className="text-[10px] text-neutral-600 font-bold w-8 text-right select-none absolute -left-12 -translate-y-1/2">
                      {val}
                    </span>
                    <div className="w-full border-t border-dashed border-neutral-800/80"></div>
                  </div>
                ))}
              </div>

              {/* Bars Column Container */}
              <div className="relative z-10 h-full flex items-end justify-between gap-4">
                {insights?.salaryRanges?.map((range, index) => {
                  const isHovered = hoveredRole === index;
                  
                  // Normalize salaries to thousands (e.g. 90000 -> 90)
                  const minSal = normalizeSalary(range.min);
                  const medSal = normalizeSalary(range.median);
                  const maxSal = normalizeSalary(range.max);

                  // Calculate heights in pixels relative to 220px chart height out of chartMaxScale max
                  const minHeight = Math.round((minSal / chartMaxScale) * 220);
                  const medHeight = Math.round((medSal / chartMaxScale) * 220);
                  const maxHeight = Math.round((maxSal / chartMaxScale) * 220);

                  return (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                      onMouseEnter={() => setHoveredRole(index)}
                      onMouseLeave={() => setHoveredRole(null)}
                    >


                      {/* Three Columns side-by-side with fixed heights */}
                      <div className="w-full max-w-[120px] flex items-end gap-1.5 relative" style={{ height: `${maxHeight}px` }}>
                        {/* Min Salary Bar */}
                        <div 
                          className="flex-1 rounded-t-sm transition-all duration-300"
                          style={{ 
                            height: `${minHeight}px`,
                            backgroundColor: '#94a3b8' 
                          }}
                        ></div>

                        {/* Median Salary Bar */}
                        <div 
                          className="flex-1 rounded-t-sm transition-all duration-300"
                          style={{ 
                            height: `${medHeight}px`,
                            backgroundColor: '#475569' 
                          }}
                        ></div>

                        {/* Max Salary Bar */}
                        <div 
                          className="flex-1 rounded-t-sm transition-all duration-300"
                          style={{ 
                            height: `${maxHeight}px`,
                            backgroundColor: '#1e293b' 
                          }}
                        ></div>

                        {/* Interactive Float Tooltip Popover */}
                        {isHovered && (
                          <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-[#09090b] border border-neutral-800 p-4 rounded-lg shadow-2xl z-30 min-w-[160px] space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                            <div className="text-xs font-black text-white">{range.role}</div>
                            <div className="space-y-1 text-[11px] font-medium text-neutral-400">
                              <div className="flex justify-between">
                                <span>Min Salary (K):</span>
                                <span className="text-white font-bold">${Math.round(minSal)}K</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Median Salary (K):</span>
                                <span className="text-white font-bold">${Math.round(medSal)}K</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Max Salary (K):</span>
                                <span className="text-white font-bold">${Math.round(maxSal)}K</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* X-Axis Labels */}
                      <div className="text-[10px] text-neutral-500 font-bold text-center mt-3 truncate w-full absolute bottom-[-28px]">
                        {range.role}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
          {/* Extra spacing for X-axis labels overflow */}
          <div className="h-4"></div>
        </div>

        {/* Industry Trends & Recommended Skills columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Industry Trends */}
          <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Key Industry Trends</h3>
              <p className="text-[10px] text-neutral-500 font-medium">Current trends shaping the industry</p>
            </div>
            <ul className="space-y-2.5">
              {insights?.keyTrends?.map((trend, index) => (
                <li key={index} className="text-xs text-neutral-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Skills */}
          <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Recommended Skills</h3>
              <p className="text-[10px] text-neutral-500 font-medium">Skills to consider developing</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights?.recommendedSkills?.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded-lg border border-neutral-850 bg-black text-[10px] text-neutral-300 font-bold transition-all hover:border-neutral-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Center Footer Credit */}
      <footer className="border-t border-neutral-900 py-12 bg-black relative z-10 text-center">
        <div className="container mx-auto px-6">
          <div className="text-xs text-neutral-500 font-medium">
            &copy; {new Date().getFullYear()} SensAI. All rights reserved.
          </div>
        </div>
      </footer>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default DashboardPage;
