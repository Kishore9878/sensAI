import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { 
  Trophy, 
  HelpCircle, 
  Award,
  Sparkles, 
  ChevronRight, 
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowLeft,
  LayoutGrid,
  ChevronDown,
  FileText,
  User,
  LogOut
} from 'lucide-react';

const InterviewPrepPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Session States
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null); // When set, views this quiz's results on the page
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Navigation & Page Flow States
  const [showStartScreen, setShowStartScreen] = useState(false); // For "Mock Interview Start Screen"
  const [quizMode, setQuizMode] = useState(false); // Active mock quiz questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: userAnswer }
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentSession, setCurrentSession] = useState(null); // Active session being taken
  const [showExplanation, setShowExplanation] = useState(false);

  // Layout Dropdown state
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  // Chart hover state
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fetch previous sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('/interview');
      setSessions(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not load previous interview history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Start Session (Mock Interview API Call)
  const handleStartSession = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post('/interview/start', { category: 'Technical' });
      setCurrentSession(res.data);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      setShowExplanation(false);
      setQuizMode(true);
      setShowStartScreen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to start interview session.');
    } finally {
      setActionLoading(false);
    }
  };

  // Next Question
  const handleNext = () => {
    if (!currentSession) return;
    const currentQ = currentSession.questions[currentQuestionIndex];
    
    // Save current response
    setAnswers(prev => ({ ...prev, [currentQ._id]: currentAnswer }));
    setShowExplanation(false);

    if (currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Retrieve next answer if already selected
      const nextQ = currentSession.questions[currentQuestionIndex + 1];
      setCurrentAnswer(answers[nextQ._id] || '');
    }
  };

  // Previous Question
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Save current before leaving
      const currentQ = currentSession.questions[currentQuestionIndex];
      setAnswers(prev => ({ ...prev, [currentQ._id]: currentAnswer }));
      setShowExplanation(false);

      setCurrentQuestionIndex(prev => prev - 1);
      const prevQ = currentSession.questions[currentQuestionIndex - 1];
      setCurrentAnswer(answers[prevQ._id] || '');
    }
  };

  // Submit Session Answers
  const handleSubmit = async () => {
    if (!currentSession) return;
    // Save final answer
    const currentQ = currentSession.questions[currentQuestionIndex];
    const finalAnswers = { ...answers, [currentQ._id]: currentAnswer };

    setActionLoading(true);
    setError('');
    try {
      const payload = {
        answers: Object.keys(finalAnswers).map(qId => ({
          questionId: qId,
          userAnswer: finalAnswers[qId],
        })),
      };

      const res = await axiosInstance.post(`/interview/submit/${currentSession._id}`, payload);
      setQuizMode(false);
      setCurrentSession(null);
      // Prepend to historical list
      setSessions(prev => [res.data, ...prev]);
      // Open results page view directly
      setActiveSession(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to grade interview answers.');
    } finally {
      setActionLoading(false);
    }
  };

  // Statistics calculation
  const gradedSessions = sessions.filter(s => s.quizScore > 0);
  const avgScore = gradedSessions.length > 0 
    ? (gradedSessions.reduce((acc, s) => acc + s.quizScore, 0) / gradedSessions.length).toFixed(1) 
    : '0.0';
  const questionsPracticed = sessions.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  const latestScore = gradedSessions.length > 0 
    ? gradedSessions[0].quizScore.toFixed(1) 
    : '0.0';

  // Format date helper
  const formatDate = (dateStr) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  // SVG Chart rendering helper
  const renderSVGChart = () => {
    const data = [...sessions]
      .reverse()
      .filter(s => s.quizScore > 0);

    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-semibold py-20">
          Start your first mock interview to track performance trends over time.
        </div>
      );
    }

    const svgWidth = 900;
    const svgHeight = 240;
    const paddingLeft = 50;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    // Map data points
    const points = data.map((d, index) => {
      const x = paddingLeft + (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2);
      const y = paddingTop + chartHeight - (d.quizScore / 100) * chartHeight;
      return { x, y, score: d.quizScore, date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    });

    // Build SVG Path string
    let pathD = '';
    if (points.length > 1) {
      pathD = `M ${points[0].x} ${points[0].y} `;
      for (let i = 1; i < points.length; i++) {
        // Curve construction using bezier control points
        const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY1 = points[i - 1].y;
        const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY2 = points[i].y;
        pathD += `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y} `;
      }
    } else if (points.length === 1) {
      pathD = `M ${points[0].x - 50} ${points[0].y} L ${points[0].x + 50} ${points[0].y}`;
    }

    // Grid lines
    const yGridValues = [0, 25, 50, 75, 100];

    return (
      <div className="relative w-full">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto text-neutral-500 font-semibold select-none overflow-visible">
          {/* Horizontal dotted grid lines */}
          {yGridValues.map((val) => {
            const y = paddingTop + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={svgWidth - paddingRight} 
                  y2={y} 
                  stroke="#1c1c24" 
                  strokeDasharray="3,3" 
                  strokeWidth="1"
                />
                <text 
                  x={paddingLeft - 15} 
                  y={y + 4} 
                  fill="#52525b" 
                  textAnchor="end" 
                  className="text-[10px]"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Vertical dotted grid lines */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <line 
                x1={pt.x} 
                y1={paddingTop} 
                x2={pt.x} 
                y2={paddingTop + chartHeight} 
                stroke="#1c1c24" 
                strokeDasharray="3,3" 
                strokeWidth="1"
              />
              <text 
                x={pt.x} 
                y={paddingTop + chartHeight + 20} 
                fill="#52525b" 
                textAnchor="middle" 
                className="text-[10px]"
              >
                {pt.date}
              </text>
            </g>
          ))}

          {/* Curved score path */}
          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="white" 
              strokeWidth="2"
            />
          )}

          {/* Interactive Circle Dots */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="white"
              className="cursor-pointer hover:r-6 transition-all"
              onMouseEnter={() => setHoveredPoint({ idx, x: pt.x, y: pt.y, score: pt.score, date: pt.date })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredPoint && (
          <div 
            className="absolute bg-black border border-neutral-800 p-2.5 rounded shadow-lg text-[10px] text-white pointer-events-none z-30 flex flex-col font-sans"
            style={{ 
              left: `${(hoveredPoint.x / svgWidth) * 100}%`, 
              top: `${(hoveredPoint.y / svgHeight) * 100 - 30}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <span className="font-bold">Score: {hoveredPoint.score}%</span>
            <span className="text-neutral-500 mt-0.5">{hoveredPoint.date}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col font-sans selection:bg-indigo-500/20">
      
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
                className="w-8 h-8 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center overflow-hidden hover:border-neutral-500 transition-all duration-200"
              >
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-neutral-950 border border-neutral-800 rounded-lg shadow-xl py-1 z-50">
                  {user && (
                    <div className="px-4 py-2 border-b border-neutral-900">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                    </div>
                  )}
                  <Link 
                    to="/complete-profile" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                    Complete Profile
                  </Link>
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
      <main className="flex-1 container mx-auto px-6 py-10 relative z-10 space-y-6 max-w-5xl">

        {/* Error Notification banner */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        {/* VIEW 1: Main Interview Prep Dashboard */}
        {!showStartScreen && !quizMode && !activeSession && (
          <div className="space-y-6">
            
            {/* Header Title */}
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Interview Preparation</h1>
            </div>

            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between relative">
                <Trophy className="absolute top-6 right-6 w-4 h-4 text-neutral-400" />
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Average Score</span>
                  <div className="text-2xl font-bold text-white mt-1">{avgScore}%</div>
                </div>
                <span className="text-[10px] text-neutral-500 mt-4 block">Across all assessments</span>
              </div>

              <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between relative">
                <HelpCircle className="absolute top-6 right-6 w-4 h-4 text-neutral-400" />
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Questions Practiced</span>
                  <div className="text-2xl font-bold text-white mt-1">{questionsPracticed}</div>
                </div>
                <span className="text-[10px] text-neutral-500 mt-4 block">Total questions</span>
              </div>

              <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between relative">
                <Award className="absolute top-6 right-6 w-4 h-4 text-neutral-400" />
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Latest Score</span>
                  <div className="text-2xl font-bold text-white mt-1">{latestScore}%</div>
                </div>
                <span className="text-[10px] text-neutral-500 mt-4 block">Most recent quiz</span>
              </div>
            </div>

            {/* Performance Trend Chart */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Performance Trend</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Your quiz scores over time</p>
              </div>
              <div className="pt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  renderSVGChart()
                )}
              </div>
            </div>

            {/* Recent Quizzes List Container */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Quizzes</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Review your past quiz performance</p>
                </div>
                <button
                  onClick={() => setShowStartScreen(true)}
                  className="bg-white hover:bg-neutral-100 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  Start New Quiz
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-neutral-500 font-semibold">
                    No quizzes recorded. Click 'Start New Quiz' to begin!
                  </div>
                ) : (
                  sessions.map((sess, idx) => (
                    <div
                      key={sess._id}
                      onClick={() => setActiveSession(sess)}
                      className="p-5 border border-neutral-900 hover:border-neutral-800 bg-[#060608]/50 hover:bg-[#09090b] rounded-xl cursor-pointer flex flex-col gap-3 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">Quiz {sessions.length - idx}</span>
                        <span className="text-[10px] text-neutral-500 font-semibold">{formatDate(sess.createdAt)}</span>
                      </div>
                      <div className="text-xs text-neutral-400">
                        Score: <span className="font-semibold text-white">{sess.quizScore.toFixed(1)}%</span>
                      </div>
                      {sess.improvementTip && (
                        <p className="text-xs text-neutral-500 leading-relaxed truncate max-w-3xl">
                          {sess.improvementTip}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: Mock Interview Launch Card Screen */}
        {showStartScreen && !quizMode && (
          <div className="space-y-4">
            <button
              onClick={() => setShowStartScreen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-semibold mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Interview Preparation</span>
            </button>

            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Mock Interview</h1>
              <p className="text-xs text-neutral-500 mt-1">Test your knowledge with industry-specific questions</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-5">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm">Ready to test your knowledge?</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  This quiz contains 10 questions specific to your industry and skills. Take your time and choose the best answer for each question.
                </p>
              </div>

              <button
                onClick={handleStartSession}
                disabled={actionLoading}
                className="w-full bg-white hover:bg-neutral-100 text-black py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Start Quiz'
                )}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: Active Mock Interview Wizard */}
        {quizMode && currentSession && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setQuizMode(false);
                setCurrentSession(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-semibold mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Interview Preparation</span>
            </button>

            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Mock Interview</h1>
              <p className="text-xs text-neutral-500 mt-1">Test your knowledge with industry-specific questions</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-xs font-bold text-neutral-400">
                  Question {currentQuestionIndex + 1} of {currentSession.questions.length}
                </span>
              </div>

              {/* Question Text & Options list */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white leading-relaxed">
                  {currentSession.questions[currentQuestionIndex].question}
                </h3>
                
                <div className="space-y-3">
                  {(currentSession.questions[currentQuestionIndex].options || []).map((option, oIdx) => (
                    <div 
                      key={oIdx}
                      onClick={() => setCurrentAnswer(option)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        currentAnswer === option 
                          ? 'border-indigo-500 bg-indigo-600/5 text-white' 
                          : 'border-neutral-900 bg-[#060608] text-neutral-400 hover:bg-neutral-900/50 hover:text-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        currentAnswer === option ? 'border-indigo-500' : 'border-neutral-750'
                      }`}>
                        {currentAnswer === option && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <span className="text-xs font-semibold">{option}</span>
                    </div>
                  ))}
                </div>

                {/* Optional explanation reveal */}
                {showExplanation && (
                  <div className="p-4 rounded-xl border border-neutral-900 bg-[#0c0c0e] text-xs text-neutral-300 leading-relaxed animate-in fade-in duration-200">
                    <span className="font-bold text-white">Explanation: </span>
                    {currentSession.questions[currentQuestionIndex].feedback || "No explanation provided for this question."}
                  </div>
                )}
              </div>

              {/* Wizard Navigation Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 border border-neutral-850 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="px-4 py-2 border border-neutral-850 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-all"
                  >
                    {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                  </button>
                </div>

                {currentQuestionIndex < currentSession.questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="bg-white hover:bg-neutral-100 text-black px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={actionLoading}
                    className="bg-white hover:bg-neutral-100 text-black px-5 py-2.5 rounded-lg text-xs font-bold transition-all"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Submit Assessment'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Quiz Results Directly Rendered on the Page */}
        {activeSession && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveSession(null)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-semibold mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Interview Preparation</span>
            </button>

            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Mock Interview</h1>
              <p className="text-xs text-neutral-500 mt-1">Test your knowledge with industry-specific questions</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-6">
              
              {/* Quiz Results Header */}
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <span>🏆 Quiz Results</span>
              </h3>

              {/* Score bar block */}
              <div className="text-center space-y-3">
                <div className="text-3xl font-extrabold text-white">{activeSession.quizScore.toFixed(1)}%</div>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-500" 
                    style={{ width: `${activeSession.quizScore}%` }}
                  />
                </div>
              </div>

              {/* Improvement tip box banner */}
              {activeSession.improvementTip && (
                <div className="p-4 rounded-xl border border-neutral-900 bg-[#0c0c0e] text-xs text-neutral-300 leading-relaxed">
                  <span className="font-bold text-white">Improvement Tip: </span>
                  {activeSession.improvementTip}
                </div>
              )}

              {/* Question breakdown review checklist */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Question Review</h4>
                {activeSession.questions?.map((q, idx) => (
                  <div key={q._id || idx} className="border border-neutral-900 rounded-xl bg-black/30 overflow-hidden">
                    <div className="p-4 bg-black/40 border-b border-neutral-900 flex items-start justify-between gap-4">
                      <h5 className="text-xs font-bold text-white leading-relaxed">{q.question}</h5>
                      {q.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="p-4 space-y-3 text-[11px] leading-relaxed">
                      <div>
                        <span className="font-bold text-neutral-500 uppercase block text-[9px] mb-0.5">Your Answer</span>
                        <p className="text-neutral-300">{q.userAnswer || '[No Answer Provided]'}</p>
                      </div>

                      {!q.isCorrect && (
                        <div>
                          <span className="font-bold text-neutral-500 uppercase block text-[9px] mb-0.5">Correct Answer</span>
                          <p className="text-neutral-300">{q.answer}</p>
                        </div>
                      )}

                      {q.feedback && (
                        <div className="pt-2 border-t border-neutral-900">
                          <span className="font-bold text-neutral-500 uppercase block text-[9px] mb-0.5">Explanation</span>
                          <p className="text-neutral-300">{q.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Center Footer Credit */}
      <footer className="border-t border-neutral-900 py-12 bg-black relative z-10 text-center">
        <div className="container mx-auto px-6">
          <div className="text-xs text-neutral-500 font-medium">
            &copy; {new Date().getFullYear()} SensAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InterviewPrepPage;
