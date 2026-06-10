import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import MDEditor from '@uiw/react-md-editor';
import "@uiw/react-md-editor/markdown-editor.css";
import {
  Sparkles,
  LayoutGrid,
  ChevronDown,
  Save,
  Download,
  Calendar,
  FileText,
  AlertTriangle,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  PlusCircle,
  User,
  LogOut
} from 'lucide-react';

const ResumeBuilderPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Tab switcher mode: 'form' or 'markdown'
  const [tabMode, setTabMode] = useState('form');
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Resume content & score states
  const [resume, setResume] = useState(null);
  const [editorText, setEditorText] = useState('');

  // Structured Form States
  const [contactInfo, setContactInfo] = useState({
    email: '',
    mobile: '',
    linkedin: '',
    twitter: ''
  });
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);

  // Form toggles and state for adding entries
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [expForm, setExpForm] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [showAddEducation, setShowAddEducation] = useState(false);
  const [eduForm, setEduForm] = useState({
    degree: '',
    school: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [showAddProject, setShowAddProject] = useState(false);
  const [projForm, setProjForm] = useState({
    title: '',
    technologies: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  // Load hidden JSON structure from markdown content
  const parseResumeData = (contentString, profileData) => {
    try {
      const match = contentString.match(/<!-- sensai-resume-data: (.*) -->/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.contactInfo) setContactInfo(parsed.contactInfo);
        if (parsed.summary !== undefined) setSummary(parsed.summary);
        if (parsed.skills !== undefined) setSkills(parsed.skills);
        if (parsed.experiences) setExperiences(parsed.experiences);
        if (parsed.educations) setEducations(parsed.educations);
        if (parsed.projects) setProjects(parsed.projects);
        return;
      }
    } catch (e) {
      console.error("Failed to parse hidden resume metadata:", e);
    }

    // Fallback if metadata comment not found (e.g. freshly generated AI resume)
    if (profileData) {
      setContactInfo({
        email: user?.email || '',
        mobile: '',
        linkedin: profileData.linkedinUrl || '',
        twitter: ''
      });
      setSummary(profileData.bio || '');
      setSkills(profileData.skills?.join(', ') || '');

      if (profileData.education && profileData.education.length > 0) {
        setEducations(profileData.education.map(edu => ({
          degree: edu.degree || '',
          school: edu.school || '',
          startDate: edu.startYear ? `${edu.startYear}-01` : '',
          endDate: edu.endYear ? `${edu.endYear}-01` : '',
          current: !edu.endYear,
          description: edu.fieldOfStudy ? `Field of study: ${edu.fieldOfStudy}` : ''
        })));
      }
    } else {
      setContactInfo({
        email: user?.email || '',
        mobile: '',
        linkedin: '',
        twitter: ''
      });
    }
  };

  // Construct Markdown representation with centered headings and emojis
  const generateMarkdownFromForm = (info, summ, sks, exps, edus, projs) => {
    let md = `<h1 align="center">${user?.name || 'Resume'}</h1>\n`;

    // Contact Info line
    const contactParts = [];
    if (info.email) contactParts.push(`📧 ${info.email}`);
    if (info.mobile) contactParts.push(`📱 ${info.mobile}`);
    if (info.linkedin) contactParts.push(`💼 [LinkedIn](${info.linkedin})`);
    if (info.twitter) contactParts.push(`🐦 [Twitter](${info.twitter})`);

    if (contactParts.length > 0) {
      md += `<p align="center">${contactParts.join(' | ')}</p>\n\n`;
    }

    md += `<hr />\n\n`;

    // Summary
    if (summ) {
      md += `## Professional Summary\n\n${summ}\n\n`;
    }

    // Skills
    if (sks) {
      md += `## Skills\n\n${sks}\n\n`;
    }

    // Experience
    if (exps.length > 0) {
      md += `## Work Experience\n\n`;
      exps.forEach(exp => {
        md += `### ${exp.title} | ${exp.company}\n`;
        md += `*${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}*\n\n`;
        md += `${exp.description}\n\n`;
      });
    }

    // Education
    if (edus.length > 0) {
      md += `## Education\n\n`;
      edus.forEach(edu => {
        md += `### ${edu.degree} | ${edu.school}\n`;
        md += `*${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}*\n\n`;
        md += `${edu.description}\n\n`;
      });
    }

    // Projects
    if (projs.length > 0) {
      md += `## Projects\n\n`;
      projs.forEach(proj => {
        md += `### ${proj.title} | ${proj.technologies}\n`;
        md += `*${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}*\n\n`;
        md += `${proj.description}\n\n`;
      });
    }

    const metadata = {
      contactInfo: info,
      summary: summ,
      skills: sks,
      experiences: exps,
      educations: edus,
      projects: projs
    };

    md += `\n<!-- sensai-resume-data: ${JSON.stringify(metadata)} -->`;
    return md;
  };

  // Fetch resume & profile
  const fetchResumeAndProfile = async () => {
    try {
      setLoading(true);
      setError('');

      let profileData = null;
      try {
        const profileRes = await axiosInstance.get('/profile');
        profileData = profileRes.data;
        setProfile(profileRes.data);
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }

      const res = await axiosInstance.get('/resume');
      setResume(res.data);
      setEditorText(res.data.content);
      parseResumeData(res.data.content, profileData);
    } catch (err) {
      if (err.response?.status === 404) {
        if (profile) {
          setContactInfo({
            email: user?.email || '',
            mobile: '',
            linkedin: profile.linkedinUrl || '',
            twitter: ''
          });
          setSummary(profile.bio || '');
          setSkills(profile.skills?.join(', ') || '');
        } else {
          setContactInfo(prev => ({ ...prev, email: user?.email || '' }));
        }
      } else {
        setError('Failed to fetch resume.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeAndProfile();
  }, []);

  // AI Generation
  const handleGenerateAI = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await axiosInstance.post('/resume/generate');
      setResume(res.data);
      setEditorText(res.data.content);
      parseResumeData(res.data.content, profile);
      setSuccess('Resume generated and optimized by AI!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate resume.');
    } finally {
      setActionLoading(false);
    }
  };

  // Manual Save
  const handleSave = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      let contentToSave = editorText;
      if (tabMode === 'form') {
        contentToSave = generateMarkdownFromForm(contactInfo, summary, skills, experiences, educations, projects);
        setEditorText(contentToSave);
      }

      const res = await axiosInstance.put('/resume', {
        content: contentToSave,
        atsScore: resume?.atsScore || 75,
        feedback: resume?.feedback || 'Custom edited. Re-run AI generator to score compliance.',
      });
      setResume(res.data);
      setSuccess('Resume saved successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to save resume.');
    } finally {
      setActionLoading(false);
    }
  };

  // Polish experience descriptions using backend AI
  const handleImproveWithAI = async (type) => {
    let textToImprove = '';
    if (type === 'experience') textToImprove = expForm.description;
    else if (type === 'education') textToImprove = eduForm.description;
    else if (type === 'project') textToImprove = projForm.description;

    if (!textToImprove.trim()) {
      setError('Please write a description draft first before polishing with AI.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const res = await axiosInstance.post('/resume/improve', {
        description: textToImprove,
        industry: profile?.industry || ''
      });

      if (type === 'experience') setExpForm(prev => ({ ...prev, description: res.data.improved }));
      else if (type === 'education') setEduForm(prev => ({ ...prev, description: res.data.improved }));
      else if (type === 'project') setProjForm(prev => ({ ...prev, description: res.data.improved }));

      setSuccess('Description optimized by AI!');
    } catch (err) {
      console.error(err);
      setError('Failed to improve description.');
    } finally {
      setActionLoading(false);
    }
  };

  // Styled PDF / Print export
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${user?.name || 'Resume'} - SensAI</title>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              color: #111;
              line-height: 1.5;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { font-size: 26px; font-weight: 800; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; }
            .contact-info { font-size: 12px; color: #555; margin-bottom: 25px; border-bottom: 2px solid #222; padding-bottom: 10px; text-align: center; }
            h2 { font-size: 15px; font-weight: 700; margin-top: 22px; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid #aaa; padding-bottom: 2px; letter-spacing: 0.5px; }
            h3 { font-size: 13px; font-weight: 700; margin: 10px 0 2px 0; display: flex; justify-content: space-between; }
            .dates { font-size: 11px; font-style: italic; color: #666; font-weight: normal; }
            p { font-size: 12px; margin-top: 4px; margin-bottom: 10px; color: #333; line-height: 1.5; }
            .skills-list { font-size: 12px; font-weight: 550; }
          </style>
        </head>
        <body>
          <h1>${user?.name || 'Resume'}</h1>
          <div class="contact-info">
            ${contactInfo.email ? `Email: ${contactInfo.email}` : ''}
            ${contactInfo.mobile ? ` | Mobile: ${contactInfo.mobile}` : ''}
            ${contactInfo.linkedin ? ` | LinkedIn: ${contactInfo.linkedin}` : ''}
            ${contactInfo.twitter ? ` | Twitter: ${contactInfo.twitter}` : ''}
          </div>
          
          ${summary ? `
            <h2>Professional Summary</h2>
            <p>${summary}</p>
          ` : ''}

          ${skills ? `
            <h2>Skills</h2>
            <p class="skills-list">${skills}</p>
          ` : ''}

          ${experiences.length > 0 ? `
            <h2>Work Experience</h2>
            ${experiences.map(exp => `
              <h3>
                <span><strong>${exp.title}</strong> at ${exp.company}</span>
                <span class="dates">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
              </h3>
              <p style="white-space: pre-line;">${exp.description}</p>
            `).join('')}
          ` : ''}

          ${educations.length > 0 ? `
            <h2>Education</h2>
            ${educations.map(edu => `
              <h3>
                <span><strong>${edu.degree}</strong> at ${edu.school}</span>
                <span class="dates">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</span>
              </h3>
              <p style="white-space: pre-line;">${edu.description}</p>
            `).join('')}
          ` : ''}

          ${projects.length > 0 ? `
            <h2>Projects</h2>
            ${projects.map(proj => `
              <h3>
                <span><strong>${proj.title}</strong> | ${proj.technologies}</span>
                <span class="dates">${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}</span>
              </h3>
              <p style="white-space: pre-line;">${proj.description}</p>
            `).join('')}
          ` : ''}

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Keep editorText synchronized when opening Markdown tab
  useEffect(() => {
    if (tabMode === 'markdown') {
      const content = generateMarkdownFromForm(contactInfo, summary, skills, experiences, educations, projects);
      setEditorText(content);
    }
  }, [tabMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

        {/* Page Title & Save/Download Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-5">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Resume Builder</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 bg-[#991b1b] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle buttons */}
        <div className="flex justify-between items-center">
          <div className="bg-neutral-900 border border-neutral-850 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setTabMode('form')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tabMode === 'form'
                  ? 'bg-neutral-800 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
                }`}
            >
              Form
            </button>
            <button
              onClick={() => setTabMode('markdown')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tabMode === 'markdown'
                  ? 'bg-neutral-800 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
                }`}
            >
              Markdown
            </button>
          </div>

          {tabMode === 'markdown' && (
            <button
              onClick={handleGenerateAI}
              disabled={actionLoading}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate with AI</span>
            </button>
          )}
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
            {success}
          </div>
        )}

        {/* Dynamic Tab Panel */}
        {tabMode === 'form' ? (
          /* FORM BUILDER MODE */
          <div className="space-y-6">

            {/* Contact Information */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <h3 className="font-bold text-white text-sm">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <input
                    type="text"
                    value={contactInfo.mobile}
                    onChange={e => setContactInfo({ ...contactInfo, mobile: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">LinkedIn URL</label>
                  <input
                    type="text"
                    value={contactInfo.linkedin}
                    onChange={e => setContactInfo({ ...contactInfo, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">Twitter/X Profile</label>
                  <input
                    type="text"
                    value={contactInfo.twitter}
                    onChange={e => setContactInfo({ ...contactInfo, twitter: e.target.value })}
                    placeholder="https://twitter.com/your-handle"
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <h3 className="font-bold text-white text-sm">Professional Summary</h3>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Write a compelling professional summary..."
                className="w-full h-32 bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-neutral-700 resize-none"
              />
            </div>

            {/* Skills */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <h3 className="font-bold text-white text-sm">Skills</h3>
              <textarea
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="List your key skills..."
                className="w-full h-24 bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-neutral-700 resize-none"
              />
            </div>

            {/* Work Experience */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <h3 className="font-bold text-white text-sm">Work Experience</h3>

              {/* Existing list */}
              <div className="space-y-3">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-neutral-850 bg-black/30 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">{exp.title}</div>
                      <div className="text-[10px] text-neutral-400 font-semibold">{exp.company} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                      <div className="text-[11px] text-neutral-500 leading-relaxed max-w-2xl whitespace-pre-wrap">{exp.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                      className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add form */}
              {showAddExperience ? (
                <div className="border border-neutral-800 rounded-xl bg-black/40 p-5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Title/Position</label>
                      <input
                        type="text"
                        value={expForm.title}
                        onChange={e => setExpForm({ ...expForm, title: e.target.value })}
                        placeholder="Title/Position"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Organization/Company</label>
                      <input
                        type="text"
                        value={expForm.company}
                        onChange={e => setExpForm({ ...expForm, company: e.target.value })}
                        placeholder="Organization/Company"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Start Date</label>
                      <input
                        type="month"
                        value={expForm.startDate}
                        onChange={e => setExpForm({ ...expForm, startDate: e.target.value })}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">End Date</label>
                      <input
                        type="month"
                        value={expForm.endDate}
                        onChange={e => setExpForm({ ...expForm, endDate: e.target.value })}
                        disabled={expForm.current}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none disabled:opacity-30"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current-exp"
                      checked={expForm.current}
                      onChange={e => setExpForm({ ...expForm, current: e.target.checked, endDate: e.target.checked ? '' : expForm.endDate })}
                      className="w-3.5 h-3.5 rounded bg-black border-neutral-800 text-indigo-600 focus:ring-0"
                    />
                    <label htmlFor="current-exp" className="text-xs text-neutral-400 font-medium select-none cursor-pointer">Current Experience</label>
                  </div>
                  <div>
                    <textarea
                      value={expForm.description}
                      onChange={e => setExpForm({ ...expForm, description: e.target.value })}
                      placeholder="Optimized and refactored..."
                      className="w-full h-32 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleImproveWithAI('experience')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve with AI</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddExperience(false);
                          setExpForm({ title: '', company: '', startDate: '', endDate: '', current: false, description: '' });
                        }}
                        className="px-4 py-2 border border-neutral-800 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (expForm.title && expForm.company) {
                            setExperiences([...experiences, expForm]);
                            setExpForm({ title: '', company: '', startDate: '', endDate: '', current: false, description: '' });
                            setShowAddExperience(false);
                          }
                        }}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        Add Entry
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddExperience(true)}
                  className="w-full py-3 bg-[#09090b] hover:bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              )}
            </div>

            {/* Education */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <h3 className="font-bold text-white text-sm">Education</h3>

              {/* Existing list */}
              <div className="space-y-3">
                {educations.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-neutral-850 bg-black/30 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">{edu.degree}</div>
                      <div className="text-[10px] text-neutral-400 font-semibold">{edu.school} • {edu.startDate} - {edu.current ? 'Present' : edu.endDate}</div>
                      <div className="text-[11px] text-neutral-500 leading-relaxed max-w-2xl whitespace-pre-wrap">{edu.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
                      className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add form */}
              {showAddEducation ? (
                <div className="border border-neutral-800 rounded-xl bg-black/40 p-5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Title/Position</label>
                      <input
                        type="text"
                        value={eduForm.degree}
                        onChange={e => setEduForm({ ...eduForm, degree: e.target.value })}
                        placeholder="Title/Position"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Organization/Company</label>
                      <input
                        type="text"
                        value={eduForm.school}
                        onChange={e => setEduForm({ ...eduForm, school: e.target.value })}
                        placeholder="Organization/Company"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Start Date</label>
                      <input
                        type="month"
                        value={eduForm.startDate}
                        onChange={e => setEduForm({ ...eduForm, startDate: e.target.value })}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">End Date</label>
                      <input
                        type="month"
                        value={eduForm.endDate}
                        onChange={e => setEduForm({ ...eduForm, endDate: e.target.value })}
                        disabled={eduForm.current}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none disabled:opacity-30"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current-edu"
                      checked={eduForm.current}
                      onChange={e => setEduForm({ ...eduForm, current: e.target.checked, endDate: e.target.checked ? '' : eduForm.endDate })}
                      className="w-3.5 h-3.5 rounded bg-black border-neutral-800 text-indigo-600 focus:ring-0"
                    />
                    <label htmlFor="current-edu" className="text-xs text-neutral-400 font-medium select-none cursor-pointer">Current Education</label>
                  </div>
                  <div>
                    <textarea
                      value={eduForm.description}
                      onChange={e => setEduForm({ ...eduForm, description: e.target.value })}
                      placeholder="Description of your education"
                      className="w-full h-32 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleImproveWithAI('education')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve with AI</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddEducation(false);
                          setEduForm({ degree: '', school: '', startDate: '', endDate: '', current: false, description: '' });
                        }}
                        className="px-4 py-2 border border-neutral-800 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (eduForm.degree && eduForm.school) {
                            setEducations([...educations, eduForm]);
                            setEduForm({ degree: '', school: '', startDate: '', endDate: '', current: false, description: '' });
                            setShowAddEducation(false);
                          }
                        }}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        Add Entry
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddEducation(true)}
                  className="w-full py-3 bg-[#09090b] hover:bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              )}
            </div>

            {/* Projects */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <h3 className="font-bold text-white text-sm">Projects</h3>

              {/* Existing list */}
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-neutral-850 bg-black/30 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">{proj.title}</div>
                      <div className="text-[10px] text-neutral-400 font-semibold">{proj.technologies} • {proj.startDate} - {proj.current ? 'Present' : proj.endDate}</div>
                      <div className="text-[11px] text-neutral-500 leading-relaxed max-w-2xl whitespace-pre-wrap">{proj.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                      className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add form */}
              {showAddProject ? (
                <div className="border border-neutral-800 rounded-xl bg-black/40 p-5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Project</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Title/Position</label>
                      <input
                        type="text"
                        value={projForm.title}
                        onChange={e => setProjForm({ ...projForm, title: e.target.value })}
                        placeholder="Title/Position"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Organization/Company</label>
                      <input
                        type="text"
                        value={projForm.technologies}
                        onChange={e => setProjForm({ ...projForm, technologies: e.target.value })}
                        placeholder="Organization/Company"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Start Date</label>
                      <input
                        type="month"
                        value={projForm.startDate}
                        onChange={e => setProjForm({ ...projForm, startDate: e.target.value })}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">End Date</label>
                      <input
                        type="month"
                        value={projForm.endDate}
                        onChange={e => setProjForm({ ...projForm, endDate: e.target.value })}
                        disabled={projForm.current}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none disabled:opacity-30"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current-proj"
                      checked={projForm.current}
                      onChange={e => setProjForm({ ...projForm, current: e.target.checked, endDate: e.target.checked ? '' : projForm.endDate })}
                      className="w-3.5 h-3.5 rounded bg-black border-neutral-800 text-indigo-600 focus:ring-0"
                    />
                    <label htmlFor="current-proj" className="text-xs text-neutral-400 font-medium select-none cursor-pointer">Current Project</label>
                  </div>
                  <div>
                    <textarea
                      value={projForm.description}
                      onChange={e => setProjForm({ ...projForm, description: e.target.value })}
                      placeholder="Description of your project"
                      className="w-full h-32 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleImproveWithAI('project')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve with AI</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProject(false);
                          setProjForm({ title: '', technologies: '', startDate: '', endDate: '', current: false, description: '' });
                        }}
                        className="px-4 py-2 border border-neutral-800 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (projForm.title && projForm.technologies) {
                            setProjects([...projects, projForm]);
                            setProjForm({ title: '', technologies: '', startDate: '', endDate: '', current: false, description: '' });
                            setShowAddProject(false);
                          }
                        }}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        Add Entry
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddProject(true)}
                  className="w-full py-3 bg-[#09090b] hover:bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              )}
            </div>

          </div>
        ) : (
          /* MARKDOWN SOURCE & RENDERED SHEET PREVIEW MODE */
          <div className="space-y-4">

            {/* Edit / Preview Toggle Button */}
            <button
              onClick={() => setIsEditingMarkdown(!isEditingMarkdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isEditingMarkdown
                  ? 'bg-neutral-800 border-neutral-700 text-white'
                  : 'bg-neutral-900 border-neutral-850 text-neutral-300 hover:text-white'
                }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Resume</span>
            </button>

            {/* Custom Light Mode Markdown Editor Container */}
            <div data-color-mode="light" className="rounded-xl overflow-hidden border border-neutral-800 shadow-xl">
              <MDEditor
                value={editorText}
                onChange={setEditorText}
                preview={isEditingMarkdown ? 'edit' : 'preview'}
                height={600}
                visibleDragbar={false}
              />
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

export default ResumeBuilderPage;
