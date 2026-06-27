import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { 
  Sparkles, 
  LayoutGrid, 
  ChevronDown, 
  User, 
  LogOut, 
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';

const ResumeUploadPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'practice'; // 'practice' or 'mock'

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  // File states
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or DOC file.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setStatusMessage('Uploading resume file...');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      // Transition messages for premium feel
      setTimeout(() => {
        setStatusMessage('Extracting text content...');
      }, 1500);

      setTimeout(() => {
        setStatusMessage('Analyzing projects, skills, and tools using Gemini AI...');
      }, 3500);

      const res = await axiosInstance.post('/resume/upload-parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatusMessage('Resume structured successfully! Redirecting...');
      
      const destination = mode === 'mock' ? '/interview/mock/prep?type=resume' : '/interview/practice/prep?type=resume';
      
      setTimeout(() => {
        navigate(destination, { state: { type: 'resume', resumeData: res.data } });
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze resume. Please ensure it is a valid PDF or DOCX file.');
      setLoading(false);
    }
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
      <main className="flex-1 container mx-auto px-6 py-12 relative z-10 flex flex-col justify-center items-center max-w-4xl">
        
        {/* Back Link */}
        <div className="w-full max-w-2xl text-left mb-6">
          <Link
            to={mode === 'mock' ? '/interview/mock' : '/interview/practice'}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-white font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Categories</span>
          </Link>
        </div>

        {/* Card Form */}
        <div className="w-full max-w-2xl bg-[#09090b] border border-neutral-900 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-100 rounded-2xl pointer-events-none"></div>

          <div className="text-center space-y-3 mb-8 relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Resume-Based Interview Prep
            </h1>
            <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              Upload your resume in PDF or Word format. Our AI will analyze your work experience, tech stacks, and internships to generate personalized questions.
            </p>
          </div>

          {/* Form / Progress Area */}
          <div className="space-y-6 relative z-10">
            
            {loading ? (
              /* Loading State */
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-bold text-white animate-pulse">{statusMessage}</p>
                  <p className="text-[10px] text-neutral-550">This may take up to a minute. Please don't close the browser.</p>
                </div>
              </div>
            ) : (
              /* Normal Drag and Drop Upload State */
              <>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]' 
                      : 'border-neutral-850 bg-black/40 hover:border-neutral-700'
                  }`}
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                  />
                  
                  <div className="w-12 h-12 rounded-lg bg-neutral-950 border border-neutral-900 flex items-center justify-center text-neutral-400 mb-4">
                    <Upload className="w-6 h-6 text-indigo-400" />
                  </div>

                  <p className="text-sm font-bold text-white mb-1">
                    Drag and drop your resume here
                  </p>
                  <p className="text-xs text-neutral-500 mb-4">
                    Supports PDF, DOCX, or DOC (Max 5MB)
                  </p>
                  
                  <label 
                    htmlFor="file-upload"
                    className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all duration-300 border border-neutral-800 cursor-pointer"
                  >
                    Select File
                  </label>
                </div>

                {/* Selected File Card */}
                {file && (
                  <div className="p-4 rounded-xl border border-neutral-850 bg-neutral-950/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white truncate max-w-xs">{file.name}</p>
                        <p className="text-[10px] text-neutral-550">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready
                      </span>
                    </div>
                  </div>
                )}

                {/* Error alerts */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-3 text-left">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-red-300">Upload Failed</p>
                      <p className="text-[10px] text-red-200/80 leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  disabled={!file}
                  onClick={handleUpload}
                  className={`w-full py-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    file 
                      ? 'bg-white hover:bg-neutral-100 text-black cursor-pointer' 
                      : 'bg-neutral-900 text-neutral-600 border border-neutral-950 cursor-not-allowed'
                  }`}
                >
                  <span>Start AI Resume Analysis</span>
                </button>
              </>
            )}

          </div>

        </div>

      </main>

      {/* Global Profile Modal Component */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

    </div>
  );
};

export default ResumeUploadPage;
