import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { 
  Trophy, 
  HelpCircle, 
  Award,
  Sparkles, 
  ChevronRight, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  LayoutGrid,
  ChevronDown,
  FileText,
  User,
  LogOut,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  Clock,
  GraduationCap
} from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const MockInterviewPrepPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || sessionStorage.getItem('sensai_mock_type') || 'technical';
  const [interviewType, setInterviewType] = useState(initialType);
  
  const [subject, setSubject] = useState(location.state?.subject || sessionStorage.getItem('sensai_mock_subject') || '');
  const [resumeData, setResumeData] = useState(location.state?.resumeData || (sessionStorage.getItem('sensai_mock_resumedata') ? JSON.parse(sessionStorage.getItem('sensai_mock_resumedata')) : null));

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      sessionStorage.setItem('sensai_mock_type', typeParam);
      setInterviewType(typeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (location.state?.subject) {
      sessionStorage.setItem('sensai_mock_subject', location.state.subject);
      setSubject(location.state.subject);
    }
    if (location.state?.resumeData) {
      sessionStorage.setItem('sensai_mock_resumedata', JSON.stringify(location.state.resumeData));
      setResumeData(location.state.resumeData);
    }
  }, [location.state]);

  // Session States
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null); // Full feedback view
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Navigation & Page Flow States
  const [showStartScreen, setShowStartScreen] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false); // Active interview wizard
  
  // Active wizard states
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'voice'
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [showTranscriptViewOnly, setShowTranscriptViewOnly] = useState(false); // inside feedback view
  
  // Timer states
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  // Speech Recognition Ref
  const recognitionRef = useRef(null);

  // Chart hover state
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fetch previous sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get(`/mock-interview?category=${interviewType}`);
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
  }, [interviewType]);

  // Start Session (Mock Interview API Call)
  const handleStartSession = async () => {
    setActionLoading(true);
    setError('');
    try {
      const payload = { category: interviewType };
      if (interviewType === 'core_subjects') {
        payload.subject = subject;
      } else if (interviewType === 'resume') {
        payload.resumeData = resumeData;
      }
      const res = await axiosInstance.post('/mock-interview/start', payload);
      setCurrentSession(res.data);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setTranscript('');
      setSecondsElapsed(0);
      setInterviewMode(true);
      setShowStartScreen(false);
      
      // Start duration timer
      const interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
      setTimerIntervalId(interval);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to start mock interview session.');
    } finally {
      setActionLoading(false);
    }
  };

  // Text-To-Speech: Speak question aloud
  const handleSpeakQuestion = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsPlayingVoice(false);
    };
    utterance.onerror = () => {
      setIsPlayingVoice(false);
    };
    
    setIsPlayingVoice(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop SpeechSynthesis when exiting/transitioning
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speech-To-Text (WebSpeech API)
  const startSpeechRecognition = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      setInputMode('text');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Switching to text answer mode.");
        setInputMode('text');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => {
          const newT = (prev + ' ' + finalTranscript).trim();
          setUserAnswer(newT);
          return newT;
        });
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Toggle Voice Recording
  const handleToggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!currentSession) return;
    
    // Stop recording if active
    if (isRecording) {
      stopSpeechRecognition();
    }

    // Stop speaking if active
    if (isPlayingVoice && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    }

    const currentQ = currentSession.questions[currentQuestionIndex];
    setActionLoading(true);
    setError('');

    try {
      const payload = {
        questionId: currentQ._id,
        userAnswer: userAnswer,
        voiceTranscript: inputMode === 'voice' ? transcript : '',
        duration: secondsElapsed // send duration elapsed for this question
      };

      const res = await axiosInstance.post(`/mock-interview/submit/${currentSession._id}`, payload);
      
      // Reset question timer
      setSecondsElapsed(0);

      if (res.data.finished) {
        // Stop timer completely
        if (timerIntervalId) {
          clearInterval(timerIntervalId);
          setTimerIntervalId(null);
        }

        setInterviewMode(false);
        setCurrentSession(null);
        
        // Add to historical sessions list
        setSessions(prev => [res.data.session, ...prev]);
        setActiveSession(res.data.session);
      } else {
        // Advance to next question
        setCurrentSession(res.data.session);
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer('');
        setTranscript('');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to format duration (e.g. 150 seconds -> 2m 30s)
  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return '0s';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

  // Helper to format MM:SS for display timer
  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  // Statistics calculation for Mock Interviews
  const completedSessions = sessions.filter(s => s.status === 'completed');
  
  const avgScore = completedSessions.length > 0 
    ? (completedSessions.reduce((acc, s) => acc + s.overallScore, 0) / completedSessions.length).toFixed(1) 
    : '0.0';

  const interviewsCompleted = completedSessions.length;

  const avgCommScore = completedSessions.length > 0
    ? (completedSessions.reduce((acc, s) => acc + (s.categoryScores?.communication || 0), 0) / completedSessions.length).toFixed(1)
    : '0.0';

  const avgTechScore = completedSessions.length > 0
    ? (completedSessions.reduce((acc, s) => acc + (s.categoryScores?.technicalAccuracy || 0), 0) / completedSessions.length).toFixed(1)
    : '0.0';

  // Render SVG Performance Trend Chart for Mock Interviews
  const renderSVGChart = () => {
    const data = [...completedSessions]
      .reverse();

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
      const y = paddingTop + chartHeight - (d.overallScore / 100) * chartHeight;
      return { x, y, score: d.overallScore, date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    });

    let pathD = '';
    if (points.length > 1) {
      pathD = `M ${points[0].x} ${points[0].y} `;
      for (let i = 1; i < points.length; i++) {
        const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY1 = points[i - 1].y;
        const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY2 = points[i].y;
        pathD += `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y} `;
      }
    } else if (points.length === 1) {
      pathD = `M ${points[0].x - 50} ${points[0].y} L ${points[0].x + 50} ${points[0].y}`;
    }

    const yGridValues = [0, 25, 50, 75, 100];

    return (
      <div className="relative w-full">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto text-neutral-500 font-semibold select-none overflow-visible">
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

          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2.5"
            />
          )}

          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#10b981"
              stroke="black"
              strokeWidth="1.5"
              className="cursor-pointer hover:r-6 transition-all"
              onMouseEnter={() => setHoveredPoint({ idx, x: pt.x, y: pt.y, score: pt.score, date: pt.date })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {hoveredPoint && (
          <div 
            className="absolute bg-black border border-neutral-800 p-2.5 rounded shadow-lg text-[10px] text-white pointer-events-none z-30 flex flex-col font-sans"
            style={{ 
              left: `${(hoveredPoint.x / svgWidth) * 100}%`, 
              top: `${(hoveredPoint.y / svgHeight) * 100 - 30}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <span className="font-bold">Overall Score: {hoveredPoint.score}%</span>
            <span className="text-neutral-500 mt-0.5">{hoveredPoint.date}</span>
          </div>
        )}
      </div>
    );
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
      <main className="flex-1 container mx-auto px-6 py-10 relative z-10 space-y-6 max-w-7xl">

        {/* Error Notification banner */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        {/* VIEW 1: Main Interview Prep Dashboard */}
        {!showStartScreen && !interviewMode && !activeSession && (
          <div className="space-y-6">
            
            {/* Header Title */}
            <div className="space-y-2">
              <Link
                to="/interview/mock"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-white font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Interview Type Selection</span>
              </Link>
              <h1 className="text-4xl font-extrabold text-white tracking-tight capitalize">
                {(interviewType || '').replace('_', ' ')} Mock Interview
              </h1>
            </div>

            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between relative">
                <Trophy className="absolute top-6 right-6 w-4 h-4 text-neutral-500" />
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Average Score</span>
                  <div className="text-2xl font-bold text-white mt-1">{avgScore}%</div>
                </div>
                <span className="text-[10px] text-neutral-500 mt-4 block">Overall competency</span>
              </div>

              <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between relative">
                <CheckCircle className="absolute top-6 right-6 w-4 h-4 text-neutral-500" />
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Interviews Done</span>
                  <div className="text-2xl font-bold text-white mt-1">{interviewsCompleted}</div>
                </div>
                <span className="text-[10px] text-neutral-500 mt-4 block">Completed sessions</span>
              </div>

              <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between relative">
                <Mic className="absolute top-6 right-6 w-4 h-4 text-neutral-500" />
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Avg Communication</span>
                  <div className="text-2xl font-bold text-emerald-450 mt-1">{avgCommScore}/10</div>
                </div>
                <span className="text-[10px] text-neutral-500 mt-4 block">Clarity & fluency</span>
              </div>

              <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] flex flex-col justify-between relative">
                <Award className="absolute top-6 right-6 w-4 h-4 text-neutral-500" />
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Avg Technical Depth</span>
                  <div className="text-2xl font-bold text-indigo-400 mt-1">{avgTechScore}/10</div>
                </div>
                <span className="text-[10px] text-neutral-500 mt-4 block">Subject accuracy</span>
              </div>
            </div>

            {/* Performance Trend Chart */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Interview Performance Trend</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Your overall mock interview scores over time</p>
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

            {/* Recent Interviews List Container */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Interviews</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Review your past mock session feedbacks</p>
                </div>
                <button
                  onClick={() => setShowStartScreen(true)}
                  className="bg-white hover:bg-neutral-100 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Start New Interview
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-neutral-500 font-semibold">
                    No mock interviews recorded. Click 'Start New Interview' to begin!
                  </div>
                ) : (
                  sessions.map((sess, idx) => (
                    <div
                      key={sess._id}
                      onClick={() => { setActiveSession(sess); setShowTranscriptViewOnly(false); }}
                      className="p-5 border border-neutral-900 hover:border-neutral-800 bg-[#060608]/50 hover:bg-[#09090b] rounded-xl cursor-pointer flex flex-col gap-3 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">Session {sessions.length - idx}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-450 font-bold uppercase">
                            {sess.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-semibold">{formatDate(sess.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <div>
                          Overall Score: <span className="font-semibold text-white">{sess.overallScore}%</span>
                        </div>
                        <div>
                          Duration: <span className="font-semibold text-white">{formatDuration(sess.duration)}</span>
                        </div>
                      </div>
                      {sess.performanceSummary && (
                        <p className="text-xs text-neutral-500 leading-relaxed truncate max-w-3xl">
                          {sess.performanceSummary}
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
        {showStartScreen && !interviewMode && (
          <div className="space-y-4">
            <button
              onClick={() => setShowStartScreen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-white font-semibold mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Interview Dashboard</span>
            </button>

            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight capitalize">
                {(interviewType || '').replace('_', ' ')} Mock Interview
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Simulate a realistic career interview with our AI model</p>
            </div>

            <div className="p-8 rounded-2xl border border-neutral-900 bg-[#09090b] space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Interview Parameters & Guidelines</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs text-neutral-450">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                      <p className="leading-relaxed">
                        The interview consists of <strong>5 open-ended descriptive questions</strong>. Questions adapt dynamically based on your previous answers.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                      <p className="leading-relaxed">
                        You can read the questions or have the <strong>AI voice read them aloud</strong> by clicking the audio playback icon.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                      <p className="leading-relaxed">
                        Choose between <strong>typing your answer</strong> or using <strong>Speech-to-Text transcription</strong>. You can fully edit the spoken transcript before sending.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
                      <p className="leading-relaxed">
                        Your final feedback contains an overall grade (0-100), sub-scores out of 10 for key dimensions, strengths, developmental action items, and resources.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Speech recognition browser compatibility warning */}
                {!SpeechRecognition && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Speech recognition is not natively supported in this browser. You can still type your answers using Text mode. For voice transcription, please use Google Chrome.</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleStartSession}
                disabled={actionLoading}
                className="w-full bg-white hover:bg-neutral-100 text-black py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center select-none"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Start Mock Interview'
                )}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: Active Mock Interview Wizard */}
        {interviewMode && currentSession && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to exit the interview? Your progress will be lost.")) {
                    setInterviewMode(false);
                    setCurrentSession(null);
                    if (timerIntervalId) {
                      clearInterval(timerIntervalId);
                    }
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-white font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit Interview</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-bold bg-[#09090b] border border-neutral-900 px-3 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{formatTimer(secondsElapsed)}</span>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight capitalize">
                {interviewType.replace('_', ' ')} Interview Session
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Please answer the questions as thoroughly as possible.</p>
            </div>

            <div className="p-6 md:p-8 rounded-2xl border border-neutral-900 bg-[#09090b] space-y-6">
              
              {/* Progress indicator */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <span className="text-xs font-bold text-neutral-450">
                  Question {currentQuestionIndex + 1} of 5
                </span>
                
                {/* Visual dots progress indicator */}
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentQuestionIndex 
                          ? 'bg-emerald-500 scale-125' 
                          : i < currentQuestionIndex 
                            ? 'bg-neutral-700' 
                            : 'bg-neutral-900'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Text block */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {/* Speaker Button */}
                  <button 
                    onClick={() => handleSpeakQuestion(currentSession.questions[currentQuestionIndex].question)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      isPlayingVoice 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : 'bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-white'
                    }`}
                    title="Speak Question Aloud"
                  >
                    {isPlayingVoice ? <Volume2 className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">AI Question</span>
                    <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                      {currentSession.questions[currentQuestionIndex].question}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Answer Mode Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setInputMode('text'); stopSpeechRecognition(); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    inputMode === 'text'
                      ? 'bg-neutral-900 border-neutral-800 text-white shadow-md'
                      : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Text Answer
                </button>
                <button
                  type="button"
                  disabled={!SpeechRecognition}
                  onClick={() => setInputMode('voice')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    !SpeechRecognition ? 'opacity-40 cursor-not-allowed' : ''
                  } ${
                    inputMode === 'voice'
                      ? 'bg-neutral-900 border-neutral-800 text-white shadow-md'
                      : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                  title={!SpeechRecognition ? "Speech recognition is only supported on Chrome" : ""}
                >
                  Voice Answer (Speech-to-Text)
                </button>
              </div>

              {/* Answer Inputs */}
              <div className="space-y-3">
                {inputMode === 'text' ? (
                  <textarea
                    rows={8}
                    className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-700 rounded-xl p-4 text-xs text-neutral-200 outline-none resize-none transition-all leading-relaxed font-sans placeholder-neutral-700"
                    placeholder="Type your detailed interview answer here... (A good response is typically 2-4 sentences detailing specific concepts or STAR metrics)"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Voice controller buttons */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-900 bg-black/40">
                      <button
                        type="button"
                        onClick={handleToggleRecording}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isRecording 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          {isRecording ? 'Listening...' : 'Microphone Inactive'}
                        </span>
                        <p className="text-xs text-neutral-400">
                          {isRecording ? 'Speak now. The browser is capturing your voice...' : 'Click the microphone to start transcribing your answer.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Edit Transcript</span>
                      <textarea
                        rows={6}
                        className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-700 rounded-xl p-4 text-xs text-neutral-200 outline-none resize-none transition-all leading-relaxed font-sans placeholder-neutral-750"
                        placeholder="Your spoken transcript will appear here. You can click here to edit or add detail at any time."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Grading Action */}
              <div className="pt-4 border-t border-neutral-900 flex justify-end">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={actionLoading}
                  className="bg-white hover:bg-neutral-100 text-black px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 select-none"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>AI is grading response...</span>
                    </>
                  ) : (
                    <span>Submit Answer</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: Mock Interview Results Feedback view */}
        {activeSession && (
          <div className="space-y-6">
            
            {/* Action buttons header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setActiveSession(null); fetchSessions(); }}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-white font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Interview prep</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowTranscriptViewOnly(!showTranscriptViewOnly)}
                  className="bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showTranscriptViewOnly ? 'Show Summary Report' : 'View Transcript'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to retake this mock interview?")) {
                      setActiveSession(null);
                      setShowStartScreen(false);
                      handleStartSession();
                    }
                  }}
                  className="bg-white hover:bg-neutral-100 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  Retake Interview
                </button>
              </div>
            </div>

            {/* Results Title block */}
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight capitalize">
                {(activeSession.category || '').replace('_', ' ')} Mock Results
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Review your performance, detailed scores, and personalized learning roadmap.</p>
            </div>

            {!showTranscriptViewOnly ? (
              // SUMMARY REPORT DISPLAY
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Side: Score display and sub-scores */}
                <div className="md:col-span-1 space-y-6">
                  
                  {/* Overall Score Box */}
                  <div className="p-6 rounded-2xl border border-neutral-900 bg-[#09090b] flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Overall Score</span>
                    
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* Circular Progress Path */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="42" stroke="#121217" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="42" 
                          stroke="url(#scoreGradient)" 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={263.89}
                          strokeDashoffset={263.89 - (263.89 * (activeSession.overallScore || 0)) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-3xl font-black text-white">{activeSession.overallScore}%</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white capitalize">{activeSession.readiness}</div>
                      <p className="text-[10px] text-neutral-500 font-medium">Readiness level</p>
                    </div>
                  </div>

                  {/* Dimension Scores */}
                  <div className="p-6 rounded-2xl border border-neutral-900 bg-[#09090b] space-y-4 shadow-xl">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Performance Metrics</h4>
                    
                    <div className="space-y-3.5 text-[11px]">
                      {/* Technical Accuracy */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold text-neutral-350">
                          <span>Technical Depth / Reasoning</span>
                          <span className="text-white font-bold">{activeSession.categoryScores?.technicalAccuracy || 0}/10</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-900">
                          <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full" style={{ width: `${(activeSession.categoryScores?.technicalAccuracy || 0) * 10}%` }}></div>
                        </div>
                      </div>

                      {/* Communication */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold text-neutral-350">
                          <span>Communication Skills</span>
                          <span className="text-white font-bold">{activeSession.categoryScores?.communication || 0}/10</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-900">
                          <div className="bg-gradient-to-r from-emerald-600 to-emerald-450 h-full rounded-full" style={{ width: `${(activeSession.categoryScores?.communication || 0) * 10}%` }}></div>
                        </div>
                      </div>

                      {/* Problem Solving */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold text-neutral-350">
                          <span>Problem Solving</span>
                          <span className="text-white font-bold">{activeSession.categoryScores?.problemSolving || 0}/10</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-900">
                          <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full" style={{ width: `${(activeSession.categoryScores?.problemSolving || 0) * 10}%` }}></div>
                        </div>
                      </div>

                      {/* Confidence */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold text-neutral-350">
                          <span>Confidence & Assertiveness</span>
                          <span className="text-white font-bold">{activeSession.categoryScores?.confidence || 0}/10</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-900">
                          <div className="bg-gradient-to-r from-rose-600 to-rose-450 h-full rounded-full" style={{ width: `${(activeSession.categoryScores?.confidence || 0) * 10}%` }}></div>
                        </div>
                      </div>

                      {/* Completeness */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold text-neutral-350">
                          <span>Completeness</span>
                          <span className="text-white font-bold">{activeSession.categoryScores?.completeness || 0}/10</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-900">
                          <div className="bg-gradient-to-r from-sky-600 to-sky-400 h-full rounded-full" style={{ width: `${(activeSession.categoryScores?.completeness || 0) * 10}%` }}></div>
                        </div>
                      </div>

                      {/* Clarity */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold text-neutral-350">
                          <span>Clarity & Flow</span>
                          <span className="text-white font-bold">{activeSession.categoryScores?.clarity || 0}/10</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-900">
                          <div className="bg-gradient-to-r from-teal-600 to-teal-400 h-full rounded-full" style={{ width: `${(activeSession.categoryScores?.clarity || 0) * 10}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meta stats duration & difficulty */}
                  <div className="p-4 rounded-xl border border-neutral-900 bg-[#09090b] flex items-center justify-between text-xs text-neutral-450 font-semibold shadow-xl">
                    <div>
                      <span className="text-[10px] text-neutral-500 block mb-0.5 uppercase">Difficulty</span>
                      <span className="text-white">{activeSession.difficultyLevel || 'Intermediate'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 block mb-0.5 uppercase">Interview Duration</span>
                      <span className="text-white">{formatDuration(activeSession.duration)}</span>
                    </div>
                  </div>

                </div>

                {/* Right Side: Detailed Summary, Strengths, Improvements, Roadmap */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Summary Block */}
                  <div className="p-6 rounded-2xl border border-neutral-900 bg-[#09090b] space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Performance Summary</span>
                    </h3>
                    <p className="text-xs text-neutral-350 leading-relaxed">
                      {activeSession.performanceSummary}
                    </p>
                  </div>

                  {/* Strengths & Weaknesses side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="p-6 rounded-2xl border border-neutral-900 bg-[#09090b] space-y-4 shadow-xl">
                      <h3 className="text-sm font-bold text-emerald-450 uppercase tracking-wider">Key Strengths</h3>
                      <ul className="space-y-2.5">
                        {activeSession.strengths?.map((str, idx) => (
                          <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2.5">
                            <Check className="w-3.5 h-3.5 text-emerald-450 mt-0.5 flex-shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="p-6 rounded-2xl border border-neutral-900 bg-[#09090b] space-y-4 shadow-xl">
                      <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">To Improve</h3>
                      <ul className="space-y-2.5">
                        {activeSession.improvements?.map((imp, idx) => (
                          <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Next Steps & Recommended Resources */}
                  <div className="p-6 rounded-2xl border border-neutral-900 bg-[#09090b] space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Suggested Learning Roadmap</h3>
                    
                    <div className="space-y-4 text-xs text-neutral-350">
                      <div>
                        <span className="font-bold text-neutral-500 uppercase block text-[9px] mb-0.5">Recommended Next Assessment</span>
                        <p className="text-white font-semibold">{activeSession.recommendedNext || 'Mock Interview focusing on specific role metrics'}</p>
                      </div>

                      <div className="pt-4 border-t border-neutral-900/60">
                        <span className="font-bold text-neutral-500 uppercase block text-[9px] mb-3">Curated Resources</span>
                        <div className="space-y-2.5">
                          {activeSession.learningResources?.map((res, idx) => (
                            <div key={idx} className="p-3.5 border border-neutral-900 bg-neutral-950/50 hover:border-neutral-800 hover:bg-[#0b0b0e] rounded-xl flex items-center gap-3 text-neutral-300 transition-all duration-200">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-xs leading-relaxed">{res}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              // TRANSCRIPT REVIEW DISPLAY
              <div className="p-6 md:p-8 rounded-2xl border border-neutral-900 bg-[#09090b] space-y-6 shadow-xl">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <span>📝 Interview Transcript & Question Grading</span>
                </h3>

                <div className="space-y-6 pt-2">
                  {activeSession.questions?.map((q, idx) => (
                    <div key={q._id || idx} className="border border-neutral-900 rounded-xl bg-black/30 overflow-hidden">
                      {/* Question Header */}
                      <div className="p-4 bg-black/40 border-b border-neutral-900 flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Question {idx + 1}</span>
                          <h5 className="text-xs font-bold text-white leading-relaxed">{q.question}</h5>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] text-neutral-500 block uppercase font-bold">Grade Score</span>
                          <span className="text-sm font-black text-white">{q.scores?.overallQuality || 0}/10</span>
                        </div>
                      </div>
                      
                      {/* Transcript Body */}
                      <div className="p-4 space-y-4 text-[11px] leading-relaxed">
                        <div>
                          <span className="font-bold text-neutral-500 uppercase block text-[9px] mb-0.5">Your Response</span>
                          <p className="text-neutral-200 leading-relaxed font-sans bg-neutral-950/20 p-2.5 rounded-lg border border-neutral-950">
                            {q.userAnswer || '[No Response Recorded]'}
                          </p>
                        </div>

                        {q.feedback && (
                          <div className="pt-3 border-t border-neutral-900">
                            <span className="font-bold text-emerald-450 uppercase block text-[9px] mb-1">AI Assessor Grading & Feedback</span>
                            <p className="text-neutral-350 leading-relaxed">{q.feedback}</p>
                          </div>
                        )}

                        {/* Breakdown sub-scores for this specific question */}
                        <div className="pt-2 flex flex-wrap gap-2 text-[9px] font-bold text-neutral-450">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-850">
                            Technical Depth: {q.scores?.technicalAccuracy || 0}/10
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-850">
                            Communication: {q.scores?.communication || 0}/10
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-850">
                            Problem Solving: {q.scores?.problemSolving || 0}/10
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-850">
                            Confidence: {q.scores?.confidence || 0}/10
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-850">
                            Completeness: {q.scores?.completeness || 0}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default MockInterviewPrepPage;
