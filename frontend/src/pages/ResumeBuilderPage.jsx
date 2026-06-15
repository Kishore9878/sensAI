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
import { ProfileModal } from '../components/ProfileModal';

// Helper function to strip hidden metadata comment from markdown text
const stripMetadataComment = (text) => {
  if (!text) return '';
  return text.replace(/<!-- sensai-resume-data: [\s\S]*?-->/g, '').trim();
};

const ResumeBuilderPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
  const [resumeName, setResumeName] = useState('');

  // Structured Form States
  const [contactInfo, setContactInfo] = useState({
    email: '',
    mobile: '',
    linkedin: '',
    twitter: '',
    github: '',
    portfolio: ''
  });
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);

  // Form toggles, state for adding/editing entries, and temp tag states
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [editingExpIdx, setEditingExpIdx] = useState(-1);
  const [expForm, setExpForm] = useState({
    title: '',
    company: '',
    location: '',
    employmentType: 'Full Time',
    startDate: '',
    endDate: '',
    current: false,
    technologies: [],
    description: ''
  });
  const [currentExpTech, setCurrentExpTech] = useState('');

  const [showAddEducation, setShowAddEducation] = useState(false);
  const [editingEduIdx, setEditingEduIdx] = useState(-1);
  const [eduForm, setEduForm] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    cgpa: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProjIdx, setEditingProjIdx] = useState(-1);
  const [projForm, setProjForm] = useState({
    title: '',
    description: '',
    technologies: [],
    highlights: [],
    github: '',
    live: '',
    startDate: '',
    endDate: '',
    role: '',
    current: false
  });
  const [currentProjTech, setCurrentProjTech] = useState('');
  const [currentProjHighlight, setCurrentProjHighlight] = useState('');

  // Local form validation error message
  const [formError, setFormError] = useState('');

  // Load hidden JSON structure from markdown content
  const parseResumeData = (contentString, profileData) => {
    try {
      const match = contentString.match(/<!-- sensai-resume-data: (.*) -->/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.name) setResumeName(parsed.name);
        else if (user?.name) setResumeName(user.name);
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
        twitter: '',
        github: '',
        portfolio: ''
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
        twitter: '',
        github: '',
        portfolio: ''
      });
    }
  };

  // Construct Markdown representation with standard clean markdown
  const generateMarkdownFromForm = (info, summ, sks, exps, edus, projs) => {
    let md = `# ${user?.name || 'Resume'}\n\n`;

    // Contact Info line (clean, no emojis, separated by |)
    const contactParts = [];
    if (info.email) contactParts.push(info.email);
    if (info.mobile) contactParts.push(info.mobile);
    if (info.linkedin) contactParts.push(`[LinkedIn](${info.linkedin})`);
    if (info.twitter) contactParts.push(`[Twitter](${info.twitter})`);
    if (info.github) contactParts.push(`[GitHub](${info.github})`);
    if (info.portfolio) contactParts.push(`[Portfolio](${info.portfolio})`);

    if (contactParts.length > 0) {
      md += `${contactParts.join(' | ')}\n\n`;
    }

    md += `---\n\n`;

    const isExperienced = exps && exps.length > 0;

    // Helper functions for sections
    const getSummarySection = () => {
      if (!summ) return '';
      return `## Professional Summary\n\n${summ}\n\n`;
    };

    const getSkillsSection = () => {
      if (!sks) return '';
      return `## Skills\n\n${sks}\n\n`;
    };

    const getExperienceSection = () => {
      if (!exps || exps.length === 0) return '';
      let sect = `## Work Experience\n\n`;
      exps.forEach(exp => {
        const locStr = exp.location ? ` | ${exp.location}` : '';
        sect += `### ${exp.title} (${exp.employmentType || 'Full Time'}) - ${exp.company}\n`;
        sect += `*${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}${locStr}*\n\n`;
        if (exp.technologies && exp.technologies.length > 0) {
          sect += `**Technologies**: ${exp.technologies.join(', ')}\n\n`;
        }
        sect += `${exp.description}\n\n`;
      });
      return sect;
    };

    const getProjectsSection = () => {
      if (!projs || projs.length === 0) return '';
      let sect = `## Projects\n\n`;
      projs.forEach(proj => {
        const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies;
        const roleStr = proj.role ? ` (Role: ${proj.role})` : '';
        sect += `### ${proj.title}${roleStr} - ${techStr}\n`;
        sect += `*${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}*\n\n`;
        if (proj.github || proj.live) {
          const links = [];
          if (proj.github) links.push(`[GitHub](${proj.github})`);
          if (proj.live) links.push(`[Live Demo](${proj.live})`);
          sect += `**Links**: ${links.join(' | ')}\n\n`;
        }
        sect += `${proj.description}\n\n`;
        if (proj.highlights && proj.highlights.length > 0) {
          proj.highlights.forEach(highlight => {
            sect += `- ${highlight}\n`;
          });
          sect += `\n`;
        }
      });
      return sect;
    };

    const getEducationSection = () => {
      if (!edus || edus.length === 0) return '';
      let sect = `## Education\n\n`;
      edus.forEach(edu => {
        const fieldStr = edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '';
        const cgpaStr = edu.cgpa ? ` | Grade: ${edu.cgpa}` : '';
        sect += `### ${edu.degree}${fieldStr} - ${edu.school}\n`;
        sect += `*${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}${cgpaStr}*\n\n`;
        if (edu.description) {
          sect += `${edu.description}\n\n`;
        }
      });
      return sect;
    };

    if (isExperienced) {
      // Experienced: Header -> Summary -> Experience -> Projects -> Skills -> Education
      md += getSummarySection();
      md += getExperienceSection();
      md += getProjectsSection();
      md += getSkillsSection();
      md += getEducationSection();
    } else {
      // Freshers: Header -> Summary -> Skills -> Projects -> Experience -> Education
      md += getSummarySection();
      md += getSkillsSection();
      md += getProjectsSection();
      md += getExperienceSection();
      md += getEducationSection();
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

  // Extract structured states from Markdown text (pure helper)
  const getParsedStatesFromMarkdown = (md) => {
    if (!md) return {
      contactInfo: { email: '', mobile: '', linkedin: '', twitter: '', github: '', portfolio: '' },
      summary: '',
      skills: '',
      experiences: [],
      educations: [],
      projects: []
    };

    const lines = md.split('\n');

    let currentSection = '';
    let currentEntry = null;

    let name = '';
    let email = '';
    let mobile = '';
    let linkedin = '';
    let twitter = '';
    let github = '';
    let portfolio = '';
    let summaryText = [];
    let skillsText = [];
    let parsedExps = [];
    let parsedEdus = [];
    let parsedProjs = [];

    let nameFound = false;
    let contactLine = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('## ')) {
        break;
      }

      if (line.startsWith('# ')) {
        nameFound = true;
        name = line.substring(2).trim();
        continue;
      }

      if (nameFound && !contactLine && !line.startsWith('---')) {
        contactLine = line;
      }
    }

    if (contactLine) {
      const parts = contactLine.split('|').map(p => p.trim());
      parts.forEach(part => {
        if (part.includes('@')) {
          email = part;
        } else if (part.includes('[LinkedIn]')) {
          const match = part.match(/\[LinkedIn\]\((.*?)\)/);
          if (match) linkedin = match[1];
        } else if (part.includes('[Twitter]')) {
          const match = part.match(/\[Twitter\]\((.*?)\)/);
          if (match) twitter = match[1];
        } else if (part.includes('[GitHub]')) {
          const match = part.match(/\[GitHub\]\((.*?)\)/);
          if (match) github = match[1];
        } else if (part.includes('[Portfolio]')) {
          const match = part.match(/\[Portfolio\]\((.*?)\)/);
          if (match) portfolio = match[1];
        } else if (part) {
          mobile = part;
        }
      });
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('## ')) {
        const secTitle = line.substring(3).trim().toLowerCase();
        if (secTitle.includes('summary')) {
          currentSection = 'summary';
        } else if (secTitle.includes('skills')) {
          currentSection = 'skills';
        } else if (secTitle.includes('experience')) {
          currentSection = 'experience';
          currentEntry = null;
        } else if (secTitle.includes('education')) {
          currentSection = 'education';
          currentEntry = null;
        } else if (secTitle.includes('project')) {
          currentSection = 'projects';
          currentEntry = null;
        } else {
          currentSection = '';
        }
        continue;
      }

      if (currentSection === 'summary') {
        if (line) summaryText.push(lines[i]);
      } else if (currentSection === 'skills') {
        if (line) skillsText.push(lines[i]);
      } else if (currentSection === 'experience') {
        if (line.startsWith('### ')) {
          const titleCompany = line.substring(4).trim();
          let title = titleCompany;
          let company = '';
          let employmentType = 'Full Time';

          const dashParts = titleCompany.split(/\s*-\s*|\s*\|\s*/);
          if (dashParts.length > 1) {
            company = dashParts[dashParts.length - 1].trim();
            const titlePart = dashParts.slice(0, -1).join(' - ').trim();
            const empMatch = titlePart.match(/\((.*?)\)/);
            if (empMatch) {
              employmentType = empMatch[1].trim();
              title = titlePart.replace(/\(.*?\)/, '').trim();
            } else {
              title = titlePart;
            }
          } else {
            const empMatch = titleCompany.match(/\((.*?)\)/);
            if (empMatch) {
              employmentType = empMatch[1].trim();
              title = titleCompany.replace(/\(.*?\)/, '').trim();
            }
          }

          currentEntry = {
            title,
            company,
            location: '',
            employmentType,
            startDate: '',
            endDate: '',
            current: false,
            technologies: [],
            descriptionLines: []
          };
          parsedExps.push(currentEntry);
        } else if (currentEntry) {
          if ((line.startsWith('*') && line.endsWith('*')) || (line.startsWith('_') && line.endsWith('_'))) {
            const cleanLine = line.replace(/[\*_]/g, '').trim();
            const dateLocParts = cleanLine.split('|').map(p => p.trim());
            const dateRange = dateLocParts[0] || '';
            currentEntry.location = dateLocParts[1] || '';

            const dates = dateRange.split(/\s*-\s*/);
            if (dates.length > 0) {
              currentEntry.startDate = dates[0].trim();
              if (dates[1]) {
                const endVal = dates[1].trim();
                if (endVal.toLowerCase() === 'present') {
                  currentEntry.current = true;
                  currentEntry.endDate = '';
                } else {
                  currentEntry.endDate = endVal;
                }
              }
            }
          } else if (line.toLowerCase().startsWith('**technologies**:') || line.toLowerCase().startsWith('technologies:')) {
            const techVal = line.replace(/^\*\*technologies\*\*:\s*|^technologies:\s*/i, '').trim();
            currentEntry.technologies = techVal.split(',').map(t => t.trim()).filter(Boolean);
          } else {
            currentEntry.descriptionLines.push(lines[i]);
          }
        }
      } else if (currentSection === 'education') {
        if (line.startsWith('### ')) {
          const degreeSchool = line.substring(4).trim();
          let degree = degreeSchool;
          let fieldOfStudy = '';
          let school = '';

          const dashParts = degreeSchool.split(/\s*-\s*|\s*\|\s*/);
          if (dashParts.length > 1) {
            school = dashParts[dashParts.length - 1].trim();
            const degPart = dashParts.slice(0, -1).join(' - ').trim();
            if (degPart.toLowerCase().includes(' in ')) {
              const idx = degPart.toLowerCase().indexOf(' in ');
              degree = degPart.substring(0, idx).trim();
              fieldOfStudy = degPart.substring(idx + 4).trim();
            } else {
              degree = degPart;
            }
          } else {
            if (degreeSchool.toLowerCase().includes(' in ')) {
              const idx = degreeSchool.toLowerCase().indexOf(' in ');
              degree = degreeSchool.substring(0, idx).trim();
              fieldOfStudy = degreeSchool.substring(idx + 4).trim();
            }
          }

          currentEntry = {
            school,
            degree,
            fieldOfStudy,
            cgpa: '',
            startDate: '',
            endDate: '',
            current: false,
            descriptionLines: []
          };
          parsedEdus.push(currentEntry);
        } else if (currentEntry) {
          if ((line.startsWith('*') && line.endsWith('*')) || (line.startsWith('_') && line.endsWith('_'))) {
            const cleanLine = line.replace(/[\*_]/g, '').trim();
            const dateGradeParts = cleanLine.split('|').map(p => p.trim());
            const dateRange = dateGradeParts[0] || '';
            const gradeStr = dateGradeParts[1] || '';
            if (gradeStr.toLowerCase().startsWith('grade:')) {
              currentEntry.cgpa = gradeStr.replace(/^grade:\s*/i, '').trim();
            } else {
              currentEntry.cgpa = gradeStr;
            }

            const dates = dateRange.split(/\s*-\s*/);
            if (dates.length > 0) {
              currentEntry.startDate = dates[0].trim();
              if (dates[1]) {
                const endVal = dates[1].trim();
                if (endVal.toLowerCase() === 'present') {
                  currentEntry.current = true;
                  currentEntry.endDate = '';
                } else {
                  currentEntry.endDate = endVal;
                }
              }
            }
          } else {
            currentEntry.descriptionLines.push(lines[i]);
          }
        }
      } else if (currentSection === 'projects') {
        if (line.startsWith('### ')) {
          const titleTech = line.substring(4).trim();
          let title = titleTech;
          let role = '';
          let technologies = [];

          const dashParts = titleTech.split(/\s*-\s*|\s*\|\s*/);
          if (dashParts.length > 1) {
            const techVal = dashParts[dashParts.length - 1].trim();
            technologies = techVal.split(',').map(t => t.trim()).filter(Boolean);
            const titlePart = dashParts.slice(0, -1).join(' - ').trim();
            const roleMatch = titlePart.match(/\(Role:\s*(.*?)\)/i);
            if (roleMatch) {
              role = roleMatch[1].trim();
              title = titlePart.replace(/\(Role:\s*.*?\)/i, '').trim();
            } else {
              title = titlePart;
            }
          } else {
            const roleMatch = titleTech.match(/\(Role:\s*(.*?)\)/i);
            if (roleMatch) {
              role = roleMatch[1].trim();
              title = titleTech.replace(/\(Role:\s*.*?\)/i, '').trim();
            }
          }

          currentEntry = {
            title,
            role,
            technologies,
            startDate: '',
            endDate: '',
            current: false,
            github: '',
            live: '',
            descriptionLines: [],
            highlights: []
          };
          parsedProjs.push(currentEntry);
        } else if (currentEntry) {
          if ((line.startsWith('*') && line.endsWith('*')) || (line.startsWith('_') && line.endsWith('_'))) {
            const cleanLine = line.replace(/[\*_]/g, '').trim();
            const dates = cleanLine.split(/\s*-\s*/);
            if (dates.length > 0) {
              currentEntry.startDate = dates[0].trim();
              if (dates[1]) {
                const endVal = dates[1].trim();
                if (endVal.toLowerCase() === 'present' || endVal.toLowerCase() === 'ongoing') {
                  currentEntry.current = true;
                  currentEntry.endDate = '';
                } else {
                  currentEntry.endDate = endVal;
                }
              }
            }
          } else if (line.toLowerCase().startsWith('**links**:') || line.toLowerCase().startsWith('links:')) {
            const ghMatch = line.match(/\[GitHub\]\((.*?)\)/i);
            if (ghMatch) currentEntry.github = ghMatch[1];
            const liveMatch = line.match(/\[Live Demo\]\((.*?)\)/i);
            if (liveMatch) currentEntry.live = liveMatch[1];
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            currentEntry.highlights.push(line.substring(2).trim());
          } else {
            currentEntry.descriptionLines.push(lines[i]);
          }
        }
      }
    }

    const exps = parsedExps.map(exp => ({
      ...exp,
      description: exp.descriptionLines.join('\n').trim()
    }));

    const edus = parsedEdus.map(edu => ({
      ...edu,
      description: edu.descriptionLines.join('\n').trim()
    }));

    const projs = parsedProjs.map(proj => ({
      ...proj,
      description: proj.descriptionLines.join('\n').trim()
    }));

    return {
      name,
      contactInfo: { email, mobile, linkedin, twitter, github, portfolio },
      summary: summaryText.join('\n').trim(),
      skills: skillsText.join('\n').trim(),
      experiences: exps,
      educations: edus,
      projects: projs
    };
  };

  // Helper to update fields from visual contentEditable edit mode
  const handleUpdateResumeField = (fieldName, value, index = null, subField = null) => {
    if (index === null) {
      if (fieldName === 'contactInfo') {
        setContactInfo(prev => ({ ...prev, [subField]: value }));
      } else if (fieldName === 'summary') {
        setSummary(value);
      } else if (fieldName === 'skills') {
        setSkills(value);
      } else if (fieldName === 'name') {
        setResumeName(value);
      }
    } else {
      if (fieldName === 'experiences') {
        setExperiences(prev => {
          const newExps = [...prev];
          if (subField === 'technologies') {
            newExps[index] = { ...newExps[index], technologies: typeof value === 'string' ? value.split(',').map(t => t.trim()) : value };
          } else {
            newExps[index] = { ...newExps[index], [subField]: value };
          }
          return newExps;
        });
      } else if (fieldName === 'projects') {
        setProjects(prev => {
          const newProjs = [...prev];
          if (subField === 'technologies') {
            newProjs[index] = { ...newProjs[index], technologies: typeof value === 'string' ? value.split(',').map(t => t.trim()) : value };
          } else {
            newProjs[index] = { ...newProjs[index], [subField]: value };
          }
          return newProjs;
        });
      } else if (fieldName === 'educations') {
        setEducations(prev => {
          const newEdus = [...prev];
          newEdus[index] = { ...newEdus[index], [subField]: value };
          return newEdus;
        });
      }
    }
  };

  // Parse Markdown text back to React states
  const parseMarkdownToStates = (md) => {
    const parsed = getParsedStatesFromMarkdown(md);
    if (parsed.name) setResumeName(parsed.name);
    setContactInfo(parsed.contactInfo);
    setSummary(parsed.summary);
    setSkills(parsed.skills);
    setExperiences(parsed.experiences);
    setEducations(parsed.educations);
    setProjects(parsed.projects);
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
      setEditorText(stripMetadataComment(res.data.content));
      const parsed = getParsedStatesFromMarkdown(res.data.content);
      if (parsed.name) setResumeName(parsed.name);
      else setResumeName(user?.name || '');

      // Load from DB structured fields first, fallback to parsed markdown
      if (res.data.experiences && res.data.experiences.length > 0) {
        setExperiences(res.data.experiences);
      }
      if (res.data.educations && res.data.educations.length > 0) {
        setEducations(res.data.educations);
      }
      if (res.data.projects && res.data.projects.length > 0) {
        setProjects(res.data.projects);
      }
      if (res.data.contactInfo) {
        setContactInfo(res.data.contactInfo);
      }
      if (res.data.summary) {
        setSummary(res.data.summary);
      }
      if (res.data.skills) {
        setSkills(res.data.skills);
      }

      if (!res.data.experiences || res.data.experiences.length === 0) {
        parseResumeData(res.data.content, profileData);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        let profileData = null;
        try {
          const profileRes = await axiosInstance.get('/profile');
          profileData = profileRes.data;
        } catch (e) {}
        if (profileData) {
          setContactInfo({
            email: user?.email || '',
            mobile: '',
            linkedin: profileData.linkedinUrl || '',
            twitter: ''
          });
          setSummary(profileData.bio || '');
          setSkills(profileData.skills?.join(', ') || '');
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
      setEditorText(stripMetadataComment(res.data.content));
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

      const contentToSave = generateMarkdownFromForm(contactInfo, summary, skills, experiences, educations, projects);
      setEditorText(stripMetadataComment(contentToSave));

      const res = await axiosInstance.put('/resume', {
        content: contentToSave,
        atsScore: resume?.atsScore || 75,
        feedback: resume?.feedback || 'Custom edited. Re-run AI generator to score compliance.',
        contactInfo,
        summary,
        skills,
        experiences,
        educations,
        projects
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
  const handleImproveWithAI = async (type, index = null) => {
    let textToImprove = '';
    if (index !== null) {
      if (type === 'experience') textToImprove = experiences[index]?.description || '';
      else if (type === 'education') textToImprove = educations[index]?.description || '';
      else if (type === 'project') textToImprove = projects[index]?.description || '';
    } else {
      if (type === 'experience') textToImprove = expForm.description;
      else if (type === 'education') textToImprove = eduForm.description;
      else if (type === 'project') textToImprove = projForm.description;
      else if (type === 'summary') textToImprove = summary;
    }

    if (!textToImprove || !textToImprove.trim()) {
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

      const improvedText = res.data.improved;

      if (index !== null) {
        if (type === 'experience') {
          const updated = [...experiences];
          updated[index] = { ...updated[index], description: improvedText };
          setExperiences(updated);
        } else if (type === 'education') {
          const updated = [...educations];
          updated[index] = { ...updated[index], description: improvedText };
          setEducations(updated);
        } else if (type === 'project') {
          const updated = [...projects];
          updated[index] = { ...updated[index], description: improvedText };
          setProjects(updated);
        }
      } else {
        if (type === 'experience') setExpForm(prev => ({ ...prev, description: improvedText }));
        else if (type === 'education') setEduForm(prev => ({ ...prev, description: improvedText }));
        else if (type === 'project') setProjForm(prev => ({ ...prev, description: improvedText }));
        else if (type === 'summary') setSummary(improvedText);
      }

      setSuccess('Description optimized by AI!');
    } catch (err) {
      console.error(err);
      setError('Failed to improve description.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddOrUpdateExperience = () => {
    if (!expForm.title.trim()) {
      setFormError('Job Title is required.');
      return;
    }
    if (!expForm.company.trim()) {
      setFormError('Company Name is required.');
      return;
    }
    if (!expForm.startDate) {
      setFormError('Start Date is required.');
      return;
    }
    if (!expForm.current && !expForm.endDate) {
      setFormError('End Date is required unless currently working here.');
      return;
    }

    if (editingExpIdx >= 0) {
      const updated = [...experiences];
      updated[editingExpIdx] = expForm;
      setExperiences(updated);
      setEditingExpIdx(-1);
    } else {
      setExperiences([...experiences, expForm]);
    }

    setExpForm({
      title: '',
      company: '',
      location: '',
      employmentType: 'Full Time',
      startDate: '',
      endDate: '',
      current: false,
      technologies: [],
      description: ''
    });
    setShowAddExperience(false);
    setFormError('');
  };

  const handleCancelExperience = () => {
    setShowAddExperience(false);
    setEditingExpIdx(-1);
    setExpForm({
      title: '',
      company: '',
      location: '',
      employmentType: 'Full Time',
      startDate: '',
      endDate: '',
      current: false,
      technologies: [],
      description: ''
    });
    setFormError('');
  };

  const handleAddOrUpdateEducation = () => {
    if (!eduForm.school.trim()) {
      setFormError('Institution Name is required.');
      return;
    }
    if (!eduForm.degree.trim()) {
      setFormError('Degree is required.');
      return;
    }
    if (!eduForm.fieldOfStudy.trim()) {
      setFormError('Field of Study is required.');
      return;
    }
    if (!eduForm.cgpa.trim()) {
      setFormError('CGPA / Percentage is required.');
      return;
    }
    if (!eduForm.startDate) {
      setFormError('Start Date/Year is required.');
      return;
    }
    if (!eduForm.endDate) {
      setFormError('End Date/Year is required.');
      return;
    }

    if (editingEduIdx >= 0) {
      const updated = [...educations];
      updated[editingEduIdx] = eduForm;
      setEducations(updated);
      setEditingEduIdx(-1);
    } else {
      setEducations([...educations, eduForm]);
    }

    setEduForm({
      school: '',
      degree: '',
      fieldOfStudy: '',
      cgpa: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
    setShowAddEducation(false);
    setFormError('');
  };

  const handleCancelEducation = () => {
    setShowAddEducation(false);
    setEditingEduIdx(-1);
    setEduForm({
      school: '',
      degree: '',
      fieldOfStudy: '',
      cgpa: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
    setFormError('');
  };

  const handleAddOrUpdateProject = () => {
    if (!projForm.title.trim()) {
      setFormError('Project Title is required.');
      return;
    }
    if (!projForm.startDate) {
      setFormError('Start Date is required.');
      return;
    }
    if (!projForm.current && !projForm.endDate) {
      setFormError('End Date is required unless ongoing.');
      return;
    }
    if (!projForm.description.trim()) {
      setFormError('Project Description is required.');
      return;
    }

    if (editingProjIdx >= 0) {
      const updated = [...projects];
      updated[editingProjIdx] = projForm;
      setProjects(updated);
      setEditingProjIdx(-1);
    } else {
      setProjects([...projects, projForm]);
    }

    setProjForm({
      title: '',
      description: '',
      technologies: [],
      highlights: [],
      github: '',
      live: '',
      startDate: '',
      endDate: '',
      role: '',
      current: false
    });
    setShowAddProject(false);
    setFormError('');
  };

  const handleCancelProject = () => {
    setShowAddProject(false);
    setEditingProjIdx(-1);
    setProjForm({
      title: '',
      description: '',
      technologies: [],
      highlights: [],
      github: '',
      live: '',
      startDate: '',
      endDate: '',
      role: '',
      current: false
    });
    setFormError('');
  };

  // Styled PDF / Print export
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const md = tabMode === 'form'
      ? generateMarkdownFromForm(contactInfo, summary, skills, experiences, educations, projects)
      : editorText;

    const data = getParsedStatesFromMarkdown(md);
    const { contactInfo: info, summary: summ, skills: sks, experiences: exps, educations: edus, projects: projs } = data;

    const contactParts = [];
    if (info.email) contactParts.push(`<a href="mailto:${info.email}">${info.email}</a>`);
    if (info.mobile) contactParts.push(info.mobile);
    if (info.linkedin) {
      const displayLinkedin = info.linkedin.replace(/^https?:\/\/(www\.)?/, '');
      contactParts.push(`<a href="${info.linkedin}" target="_blank">${displayLinkedin}</a>`);
    }
    if (info.twitter) {
      const displayTwitter = info.twitter.replace(/^https?:\/\/(www\.)?/, '');
      contactParts.push(`<a href="${info.twitter}" target="_blank">${displayTwitter}</a>`);
    }
    if (info.github) {
      const displayGithub = info.github.replace(/^https?:\/\/(www\.)?/, '');
      contactParts.push(`<a href="${info.github}" target="_blank">${displayGithub}</a>`);
    }
    if (info.portfolio) {
      const displayPortfolio = info.portfolio.replace(/^https?:\/\/(www\.)?/, '');
      contactParts.push(`<a href="${info.portfolio}" target="_blank">${displayPortfolio}</a>`);
    }
    const contactLineHtml = contactParts.join(' | ');

    const renderMarkdownHelper = (text) => {
      if (!text) return '';
      let html = text;
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
      return html;
    };

    const renderBullets = (text) => {
      if (!text) return '';
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return '';
      return `<ul class="highlights">${lines.map(line => {
        const clean = line.replace(/^[•\-\*\s]+/, '');
        return `<li>${renderMarkdownHelper(clean)}</li>`;
      }).join('')}</ul>`;
    };

    const isExperienced = exps && exps.length > 0;
    const roleTitle = isExperienced ? exps[0].title : (profile?.industry ? profile.industry.replace(/-/g, ' ').toUpperCase() : '');

    const summaryHtml = summ ? `
      <h2>Professional Summary</h2>
      <div style="font-size: 12px; color: #222222; line-height: 1.4; white-space: pre-line;">${renderMarkdownHelper(summ)}</div>
    ` : '';

    const skillsHtml = sks ? `
      <h2>Skills</h2>
      <div class="skills-section" style="white-space: pre-line;">${renderMarkdownHelper(sks)}</div>
    ` : '';

    const experiencesHtml = exps.length > 0 ? `
      <h2>Work Experience</h2>
      ${exps.map(exp => {
        const techStr = exp.technologies && exp.technologies.length > 0 ? `<div class="tech-stack"><strong>Technologies:</strong> ${exp.technologies.join(', ')}</div>` : '';
        const locStr = exp.location ? exp.location : '';
        return `
          <div class="entry">
            <div class="entry-header">
              <span><strong>${exp.title}</strong> | ${exp.company}</span>
              <span>${exp.startDate} &ndash; ${exp.current ? 'Present' : exp.endDate}</span>
            </div>
            <div class="entry-subheader">
              <span>${exp.employmentType || 'Full Time'}${locStr ? ` | ${locStr}` : ''}</span>
            </div>
            ${techStr}
            ${renderBullets(exp.description)}
          </div>
        `;
      }).join('')}
    ` : '';

    const projectsHtml = projs.length > 0 ? `
      <h2>Projects</h2>
      ${projs.map(proj => {
        const techList = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies;
        const techStr = techList ? `<div class="tech-stack"><strong>Tech Stack:</strong> ${techList}</div>` : '';
        const roleStr = proj.role ? ` (${proj.role})` : '';
        const links = [];
        if (proj.github) links.push(`<a href="${proj.github}" target="_blank">GitHub</a>`);
        if (proj.live) links.push(`<a href="${proj.live}" target="_blank">Live Demo</a>`);
        const linksStr = links.length > 0 ? `<span class="links">[ ${links.join(' | ')} ]</span>` : '';
        
        let combinedDesc = proj.description || '';
        if (proj.highlights && proj.highlights.length > 0) {
          combinedDesc += '\n' + proj.highlights.join('\n');
        }

        return `
          <div class="entry">
            <div class="entry-header">
              <span><strong>${proj.title}</strong>${roleStr} ${linksStr}</span>
              <span>${proj.startDate} &ndash; ${proj.current ? 'Present' : proj.endDate}</span>
            </div>
            ${techStr}
            ${renderBullets(combinedDesc)}
          </div>
        `;
      }).join('')}
    ` : '';

    const educationHtml = edus.length > 0 ? `
      <h2>Education</h2>
      ${edus.map(edu => {
        const fieldStr = edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '';
        const cgpaStr = edu.cgpa ? ` | CGPA: ${edu.cgpa}` : '';
        return `
          <div class="entry">
            <div class="entry-header">
              <span><strong>${edu.school}</strong></span>
              <span>${edu.startDate} &ndash; ${edu.current ? 'Present' : edu.endDate}</span>
            </div>
            <div class="entry-subheader">
              <span>${edu.degree}${fieldStr}${cgpaStr}</span>
            </div>
            ${renderBullets(edu.description)}
          </div>
        `;
      }).join('')}
    ` : '';

    let sectionsHtml = '';
    if (isExperienced) {
      sectionsHtml = `
        ${summaryHtml}
        ${experiencesHtml}
        ${projectsHtml}
        ${skillsHtml}
        ${educationHtml}
      `;
    } else {
      sectionsHtml = `
        ${summaryHtml}
        ${skillsHtml}
        ${projectsHtml}
        ${experiencesHtml}
        ${educationHtml}
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${data.name || user?.name || 'Resume'} - SensAI</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in 0.6in;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #000000;
              line-height: 1.35;
              padding: 0;
              margin: 0;
              background: #ffffff;
              font-size: 12px;
              -webkit-font-smoothing: antialiased;
            }
            a {
              color: #000000;
              text-decoration: none;
              border-bottom: 1px dotted rgba(0, 0, 0, 0.3);
            }
            a:hover {
              border-bottom: 1px solid #000000;
            }
            .header-container {
              text-align: center;
              margin-bottom: 12px;
            }
            .header-name {
              font-size: 32px;
              font-weight: 700;
              text-align: center;
              margin-bottom: 2px;
              letter-spacing: -0.5px;
            }
            .header-title {
              font-size: 13px;
              font-weight: 600;
              color: #444444;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .contact-info {
              font-size: 11.5px;
              color: #444444;
              text-align: center;
              margin-bottom: 10px;
            }
            h2 {
              font-size: 15px;
              font-weight: 700;
              text-transform: uppercase;
              border-bottom: 1px solid #c0c0c0;
              padding-bottom: 2px;
              margin-top: 14px;
              margin-bottom: 6px;
              letter-spacing: 0.75px;
              color: #000000;
            }
            .entry {
              margin-bottom: 8px;
              page-break-inside: avoid;
            }
            .entry-header {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              font-size: 13px;
              color: #000000;
            }
            .entry-subheader {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              font-size: 11.5px;
              color: #333333;
              margin-bottom: 2px;
            }
            .tech-stack {
              font-size: 11.5px;
              color: #333333;
              margin-top: 1px;
              margin-bottom: 2px;
            }
            .project-links {
              font-size: 11px;
              margin-top: 1px;
              margin-bottom: 2px;
            }
            .links {
              font-size: 10px;
              font-weight: normal;
              margin-left: 6px;
            }
            ul.highlights {
              font-size: 12px;
              margin-top: 2px;
              margin-bottom: 4px;
              padding-left: 14px;
              color: #222222;
            }
            ul.highlights li {
              margin-bottom: 2px;
              line-height: 1.35;
            }
            .skills-section {
              font-size: 12px;
              line-height: 1.4;
              color: #222222;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="header-name">${data.name || user?.name || 'Resume'}</div>
            ${roleTitle ? `<div class="header-title">${roleTitle}</div>` : ''}
            <div class="contact-info">
              ${contactLineHtml}
            </div>
          </div>
          
          ${sectionsHtml}

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

  // Keep editorText synchronized when opening Markdown tab, and vice versa
  useEffect(() => {
    if (tabMode === 'markdown') {
      const content = generateMarkdownFromForm(contactInfo, summary, skills, experiences, educations, projects);
      setEditorText(stripMetadataComment(content));
    } else if (tabMode === 'form') {
      if (editorText) {
        parseMarkdownToStates(editorText);
      }
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
                  <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">GitHub URL</label>
                  <input
                    type="text"
                    value={contactInfo.github || ''}
                    onChange={e => setContactInfo({ ...contactInfo, github: e.target.value })}
                    placeholder="https://github.com/your-username"
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
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Work Experience</h3>
                {formError && showAddExperience && (
                  <div className="text-red-500 text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* Existing list */}
              <div className="space-y-3">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-neutral-850 bg-black/30 flex items-start justify-between">
                    <div className="space-y-1 text-left">
                      <div className="text-xs font-bold text-white">
                        {exp.title} {exp.employmentType ? `(${exp.employmentType})` : ''}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-semibold">
                        {exp.company} {exp.location ? `• ${exp.location}` : ''} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {exp.technologies.map((tech, i) => (
                            <span key={i} className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-[11px] text-neutral-500 leading-relaxed max-w-2xl whitespace-pre-wrap mt-1">{exp.description}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExpIdx(idx);
                          setExpForm({
                            title: exp.title || '',
                            company: exp.company || '',
                            location: exp.location || '',
                            employmentType: exp.employmentType || 'Full Time',
                            startDate: exp.startDate || '',
                            endDate: exp.endDate || '',
                            current: exp.current || false,
                            technologies: exp.technologies || [],
                            description: exp.description || ''
                          });
                          setShowAddExperience(true);
                          setFormError('');
                        }}
                        className="text-neutral-500 hover:text-white transition-colors p-1"
                        title="Edit Experience"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                        className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                        title="Delete Experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit form */}
              {showAddExperience ? (
                <div className="border border-neutral-800 rounded-xl bg-black/40 p-5 space-y-4 transition-all duration-300">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {editingExpIdx >= 0 ? 'Edit Experience' : 'Add Experience'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Job Title *</label>
                      <input
                        type="text"
                        value={expForm.title}
                        onChange={e => setExpForm({ ...expForm, title: e.target.value })}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Company Name *</label>
                      <input
                        type="text"
                        value={expForm.company}
                        onChange={e => setExpForm({ ...expForm, company: e.target.value })}
                        placeholder="e.g. Google"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Location</label>
                      <input
                        type="text"
                        value={expForm.location || ''}
                        onChange={e => setExpForm({ ...expForm, location: e.target.value })}
                        placeholder="e.g. San Francisco, CA (or Remote)"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Employment Type</label>
                      <select
                        value={expForm.employmentType || 'Full Time'}
                        onChange={e => setExpForm({ ...expForm, employmentType: e.target.value })}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Start Date *</label>
                      <input
                        type="month"
                        value={expForm.startDate}
                        onChange={e => setExpForm({ ...expForm, startDate: e.target.value })}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">End Date *</label>
                      <input
                        type="month"
                        value={expForm.endDate}
                        onChange={e => setExpForm({ ...expForm, endDate: e.target.value })}
                        disabled={expForm.current}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 disabled:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current-exp"
                      checked={expForm.current}
                      onChange={e => setExpForm({ ...expForm, current: e.target.checked, endDate: e.target.checked ? '' : expForm.endDate })}
                      className="w-3.5 h-3.5 rounded bg-black border-neutral-800 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="current-exp" className="text-xs text-neutral-400 font-medium select-none cursor-pointer">Currently Working Here</label>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Technologies Used</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentExpTech}
                        onChange={e => setCurrentExpTech(e.target.value)}
                        placeholder="Type a technology and press Enter or click Add"
                        className="flex-1 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (currentExpTech.trim()) {
                              if (!expForm.technologies.includes(currentExpTech.trim())) {
                                setExpForm({ ...expForm, technologies: [...expForm.technologies, currentExpTech.trim()] });
                              }
                              setCurrentExpTech('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (currentExpTech.trim()) {
                            if (!expForm.technologies.includes(currentExpTech.trim())) {
                              setExpForm({ ...expForm, technologies: [...expForm.technologies, currentExpTech.trim()] });
                            }
                            setCurrentExpTech('');
                          }
                        }}
                        className="px-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {expForm.technologies && expForm.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {expForm.technologies.map((tech, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
                            {tech}
                            <button
                              type="button"
                              onClick={() => setExpForm({ ...expForm, technologies: expForm.technologies.filter((_, idx) => idx !== i) })}
                              className="text-neutral-500 hover:text-white font-bold ml-1"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Responsibilities / Description</label>
                    <textarea
                      value={expForm.description}
                      onChange={e => setExpForm({ ...expForm, description: e.target.value })}
                      placeholder="Describe your achievements and key responsibilities..."
                      className="w-full h-32 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 resize-none"
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
                        onClick={handleCancelExperience}
                        className="px-4 py-2 border border-neutral-800 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddOrUpdateExperience}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 text-black rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {editingExpIdx >= 0 ? 'Update Entry' : 'Add Entry'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingExpIdx(-1);
                    setExpForm({
                      title: '',
                      company: '',
                      location: '',
                      employmentType: 'Full Time',
                      startDate: '',
                      endDate: '',
                      current: false,
                      technologies: [],
                      description: ''
                    });
                    setShowAddExperience(true);
                    setFormError('');
                  }}
                  className="w-full py-3 bg-[#09090b] hover:bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              )}
            </div>

            {/* Education */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Education</h3>
                {formError && showAddEducation && (
                  <div className="text-red-500 text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* Existing list */}
              <div className="space-y-3">
                {educations.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-neutral-850 bg-black/30 flex items-start justify-between">
                    <div className="space-y-1 text-left">
                      <div className="text-xs font-bold text-white">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                      <div className="text-[10px] text-neutral-400 font-semibold">{edu.school} • Grade: {edu.cgpa} • {edu.startDate} - {edu.endDate}</div>
                      {edu.description && (
                        <div className="text-[11px] text-neutral-500 leading-relaxed max-w-2xl whitespace-pre-wrap mt-1">{edu.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEduIdx(idx);
                          setEduForm({
                            school: edu.school || '',
                            degree: edu.degree || '',
                            fieldOfStudy: edu.fieldOfStudy || '',
                            cgpa: edu.cgpa || '',
                            startDate: edu.startDate || '',
                            endDate: edu.endDate || '',
                            current: edu.current || false,
                            description: edu.description || ''
                          });
                          setShowAddEducation(true);
                          setFormError('');
                        }}
                        className="text-neutral-500 hover:text-white transition-colors p-1"
                        title="Edit Education"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
                        className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                        title="Delete Education"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add form */}
              {showAddEducation ? (
                <div className="border border-neutral-800 rounded-xl bg-black/40 p-5 space-y-4 transition-all duration-300">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {editingEduIdx >= 0 ? 'Edit Education' : 'Add Education'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Institution Name *</label>
                      <input
                        type="text"
                        value={eduForm.school}
                        onChange={e => setEduForm({ ...eduForm, school: e.target.value })}
                        placeholder="e.g. Stanford University"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Degree *</label>
                      <input
                        type="text"
                        value={eduForm.degree}
                        onChange={e => setEduForm({ ...eduForm, degree: e.target.value })}
                        placeholder="e.g. Bachelor of Science"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Field of Study *</label>
                      <input
                        type="text"
                        value={eduForm.fieldOfStudy}
                        onChange={e => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                        placeholder="e.g. Computer Science"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">CGPA / Percentage *</label>
                      <input
                        type="text"
                        value={eduForm.cgpa}
                        onChange={e => setEduForm({ ...eduForm, cgpa: e.target.value })}
                        placeholder="e.g. 3.9/4.0 or 95%"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Start Year *</label>
                      <input
                        type="text"
                        value={eduForm.startDate}
                        onChange={e => setEduForm({ ...eduForm, startDate: e.target.value })}
                        placeholder="e.g. 2020"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">End Year *</label>
                      <input
                        type="text"
                        value={eduForm.endDate}
                        onChange={e => setEduForm({ ...eduForm, endDate: e.target.value })}
                        placeholder="e.g. 2024 or Present"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Description / Honors (Optional)</label>
                    <textarea
                      value={eduForm.description || ''}
                      onChange={e => setEduForm({ ...eduForm, description: e.target.value })}
                      placeholder="e.g. Graduated with Honors, GPA 3.9, Dean's List..."
                      className="w-full h-24 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 resize-none"
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
                        onClick={handleCancelEducation}
                        className="px-4 py-2 border border-neutral-850 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddOrUpdateEducation}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 text-black rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {editingEduIdx >= 0 ? 'Update Entry' : 'Add Entry'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEduIdx(-1);
                    setEduForm({
                      school: '',
                      degree: '',
                      fieldOfStudy: '',
                      cgpa: '',
                      startDate: '',
                      endDate: '',
                      current: false,
                      description: ''
                    });
                    setShowAddEducation(true);
                    setFormError('');
                  }}
                  className="w-full py-3 bg-[#09090b] hover:bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              )}
            </div>

            {/* Projects */}
            <div className="p-6 rounded-xl border border-neutral-900 bg-[#09090b] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Projects</h3>
                {formError && showAddProject && (
                  <div className="text-red-500 text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* Existing list */}
              <div className="space-y-3">
                {projects.map((proj, idx) => {
                  const techList = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies;
                  return (
                    <div key={idx} className="p-4 rounded-lg border border-neutral-850 bg-black/30 flex items-start justify-between">
                      <div className="space-y-1 text-left">
                        <div className="text-xs font-bold text-white">
                          {proj.title} {proj.role ? `(Role: ${proj.role})` : ''}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-semibold">
                          {techList} • {proj.startDate} - {proj.current ? 'Present' : proj.endDate}
                        </div>
                        {(proj.github || proj.live) && (
                          <div className="text-[10px] text-indigo-400 space-x-2">
                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>}
                            {proj.live && <a href={proj.live} target="_blank" rel="noopener noreferrer" className="hover:underline">Live Demo</a>}
                          </div>
                        )}
                        <div className="text-[11px] text-neutral-500 leading-relaxed max-w-2xl whitespace-pre-wrap mt-1">{proj.description}</div>
                        {proj.highlights && proj.highlights.length > 0 && (
                          <ul className="list-disc pl-4 text-[11px] text-neutral-500 space-y-0.5 mt-1">
                            {proj.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProjIdx(idx);
                            setProjForm({
                              title: proj.title || '',
                              description: proj.description || '',
                              technologies: Array.isArray(proj.technologies) ? proj.technologies : (proj.technologies ? proj.technologies.split(',').map(s => s.trim()) : []),
                              highlights: proj.highlights || [],
                              github: proj.github || '',
                              live: proj.live || '',
                              startDate: proj.startDate || '',
                              endDate: proj.endDate || '',
                              role: proj.role || '',
                              current: proj.current || false
                            });
                            setShowAddProject(true);
                            setFormError('');
                          }}
                          className="text-neutral-500 hover:text-white transition-colors p-1"
                          title="Edit Project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                          className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add form */}
              {showAddProject ? (
                <div className="border border-neutral-800 rounded-xl bg-black/40 p-5 space-y-4 transition-all duration-300">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {editingProjIdx >= 0 ? 'Edit Project' : 'Add Project'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Project Title *</label>
                      <input
                        type="text"
                        value={projForm.title}
                        onChange={e => setProjForm({ ...projForm, title: e.target.value })}
                        placeholder="e.g. SensAI Platform"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Your Role / Contribution</label>
                      <input
                        type="text"
                        value={projForm.role || ''}
                        onChange={e => setProjForm({ ...projForm, role: e.target.value })}
                        placeholder="e.g. Lead Frontend Architect"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Start Date</label>
                      <input
                        type="month"
                        value={projForm.startDate || ''}
                        onChange={e => setProjForm({ ...projForm, startDate: e.target.value })}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">End Date</label>
                      <input
                        type="month"
                        value={projForm.endDate || ''}
                        onChange={e => setProjForm({ ...projForm, endDate: e.target.value })}
                        disabled={projForm.current}
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 disabled:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current-proj"
                      checked={projForm.current}
                      onChange={e => setProjForm({ ...projForm, current: e.target.checked, endDate: e.target.checked ? '' : projForm.endDate })}
                      className="w-3.5 h-3.5 rounded bg-black border-neutral-800 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="current-proj" className="text-xs text-neutral-400 font-medium select-none cursor-pointer">Ongoing Project</label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">GitHub Repository URL</label>
                      <input
                        type="text"
                        value={projForm.github || ''}
                        onChange={e => setProjForm({ ...projForm, github: e.target.value })}
                        placeholder="https://github.com/username/repo"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Live Demo URL</label>
                      <input
                        type="text"
                        value={projForm.live || ''}
                        onChange={e => setProjForm({ ...projForm, live: e.target.value })}
                        placeholder="https://myproject.com"
                        className="w-full bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Technologies Used</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentProjTech}
                        onChange={e => setCurrentProjTech(e.target.value)}
                        placeholder="Type a technology and press Enter or click Add"
                        className="flex-1 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (currentProjTech.trim()) {
                              if (!projForm.technologies.includes(currentProjTech.trim())) {
                                setProjForm({ ...projForm, technologies: [...projForm.technologies, currentProjTech.trim()] });
                              }
                              setCurrentProjTech('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (currentProjTech.trim()) {
                            if (!projForm.technologies.includes(currentProjTech.trim())) {
                              setProjForm({ ...projForm, technologies: [...projForm.technologies, currentProjTech.trim()] });
                            }
                            setCurrentProjTech('');
                          }
                        }}
                        className="px-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {projForm.technologies && projForm.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {projForm.technologies.map((tech, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
                            {tech}
                            <button
                              type="button"
                              onClick={() => setProjForm({ ...projForm, technologies: projForm.technologies.filter((_, idx) => idx !== i) })}
                              className="text-neutral-500 hover:text-white font-bold ml-1"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Project Description *</label>
                    <textarea
                      value={projForm.description}
                      onChange={e => setProjForm({ ...projForm, description: e.target.value })}
                      placeholder="Briefly describe what you built and how..."
                      className="w-full h-24 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Key Highlights / Features</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentProjHighlight}
                        onChange={e => setCurrentProjHighlight(e.target.value)}
                        placeholder="e.g. Achieved 95% test coverage using Jest"
                        className="flex-1 bg-[#09090b] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (currentProjHighlight.trim()) {
                              if (!projForm.highlights.includes(currentProjHighlight.trim())) {
                                setProjForm({ ...projForm, highlights: [...projForm.highlights, currentProjHighlight.trim()] });
                              }
                              setCurrentProjHighlight('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (currentProjHighlight.trim()) {
                            if (!projForm.highlights.includes(currentProjHighlight.trim())) {
                              setProjForm({ ...projForm, highlights: [...projForm.highlights, currentProjHighlight.trim()] });
                            }
                            setCurrentProjHighlight('');
                          }
                        }}
                        className="px-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {projForm.highlights && projForm.highlights.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {projForm.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded bg-neutral-900/60 border border-neutral-850 text-xs text-neutral-300">
                            <span className="truncate flex-1 pr-2">- {highlight}</span>
                            <button
                              type="button"
                              onClick={() => setProjForm({ ...projForm, highlights: projForm.highlights.filter((_, idx) => idx !== i) })}
                              className="text-neutral-500 hover:text-red-500 font-bold px-1 transition-colors"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                        onClick={handleCancelProject}
                        className="px-4 py-2 border border-neutral-800 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddOrUpdateProject}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 text-black rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {editingProjIdx >= 0 ? 'Update Entry' : 'Add Entry'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProjIdx(-1);
                    setProjForm({
                      title: '',
                      description: '',
                      technologies: [],
                      highlights: [],
                      github: '',
                      live: '',
                      startDate: '',
                      endDate: '',
                      role: '',
                      current: false
                    });
                    setShowAddProject(true);
                    setFormError('');
                  }}
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
              <span>{isEditingMarkdown ? 'View Preview' : 'Edit Resume'}</span>
            </button>

            {/* High-fidelity paper preview of the FAANG-standard ATS-friendly document */}
            <div className="py-8 bg-neutral-950 rounded-xl border border-neutral-900 flex justify-center overflow-x-auto">
              <ResumePreview
                user={user}
                profile={profile}
                isEditable={isEditingMarkdown}
                onUpdateField={handleUpdateResumeField}
                resumeName={resumeName}
                contactInfo={contactInfo}
                summary={summary}
                skills={skills}
                experiences={experiences}
                educations={educations}
                projects={projects}
                onImproveField={handleImproveWithAI}
                actionLoading={actionLoading}
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

// High-fidelity FAANG-standard resume preview component
const ResumePreview = ({ 
  user, 
  profile, 
  isEditable = false, 
  onUpdateField = () => {}, 
  resumeName = '', 
  contactInfo = {}, 
  summary = '', 
  skills = '', 
  experiences = [], 
  educations = [], 
  projects = [],
  onImproveField = () => {},
  actionLoading = false
}) => {
  const isExperienced = experiences && experiences.length > 0;
  const roleTitle = isExperienced ? experiences[0].title : (profile?.industry ? profile.industry.replace(/-/g, ' ').toUpperCase() : '');

  // Helpers for parsing simple markdown bold/italic/links
  const renderMarkdownHelper = (text) => {
    if (!text) return '';
    let html = text;
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="underline text-blue-600 hover:text-blue-800">$1</a>');
    return html;
  };

  const renderBulletsHelper = (text) => {
    if (!text) return null;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;
    return (
      <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[12px] text-neutral-800 leading-normal">
        {lines.map((line, idx) => {
          const clean = line.replace(/^[•\-\*\s]+/, '');
          return (
            <li key={idx} dangerouslySetInnerHTML={{ __html: renderMarkdownHelper(clean) }} />
          );
        })}
      </ul>
    );
  };

  // Build contact details line elements
  const contactParts = [];
  if (contactInfo?.email) {
    contactParts.push(`<a href="mailto:${contactInfo.email}" class="hover:underline">${contactInfo.email}</a>`);
  }
  if (contactInfo?.mobile) {
    contactParts.push(contactInfo.mobile);
  }
  if (contactInfo?.linkedin) {
    const display = contactInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '');
    contactParts.push(`<a href="${contactInfo.linkedin}" target="_blank" class="hover:underline">${display}</a>`);
  }
  if (contactInfo?.twitter) {
    const display = contactInfo.twitter.replace(/^https?:\/\/(www\.)?/, '');
    contactParts.push(`<a href="${contactInfo.twitter}" target="_blank" class="hover:underline">${display}</a>`);
  }
  if (contactInfo?.github) {
    const display = contactInfo.github.replace(/^https?:\/\/(www\.)?/, '');
    contactParts.push(`<a href="${contactInfo.github}" target="_blank" class="hover:underline">${display}</a>`);
  }
  if (contactInfo?.portfolio) {
    const display = contactInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '');
    contactParts.push(`<a href="${contactInfo.portfolio}" target="_blank" class="hover:underline">${display}</a>`);
  }

  const contactLine = contactParts.join(' | ');

  // Sections
  const summarySection = (summary || isEditable) && (
    <div className="mb-3">
      <h2 className="text-[15px] font-bold text-black uppercase tracking-wider border-b border-neutral-350 pb-0.5 mb-1.5">Professional Summary</h2>
      {isEditable ? (
        <div className="space-y-1">
          <textarea
            value={summary}
            placeholder="Professional Summary..."
            onChange={(e) => onUpdateField('summary', e.target.value)}
            rows={summary ? summary.split('\n').length + 1 : 2}
            className="w-full text-[12px] text-neutral-800 leading-normal bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded p-1 outline-none resize-none transition-all"
          />
          <div className="flex justify-end pr-1">
            <button
              type="button"
              onClick={() => onImproveField('summary')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 text-[10px] text-indigo-650 hover:text-indigo-850 font-semibold bg-indigo-50 hover:bg-indigo-100/70 px-2 py-0.5 rounded transition-all"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Improve with AI</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-neutral-800 leading-normal whitespace-pre-line" dangerouslySetInnerHTML={{ __html: renderMarkdownHelper(summary) }} />
      )}
    </div>
  );

  const skillsSection = (skills || isEditable) && (
    <div className="mb-3">
      <h2 className="text-[15px] font-bold text-black uppercase tracking-wider border-b border-neutral-350 pb-0.5 mb-1.5">Skills</h2>
      {isEditable ? (
        <textarea
          value={skills}
          placeholder="Skills (comma separated)..."
          onChange={(e) => onUpdateField('skills', e.target.value)}
          rows={skills ? skills.split('\n').length + 1 : 2}
          className="w-full text-[12px] text-neutral-800 leading-normal bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded p-1 outline-none resize-none transition-all"
        />
      ) : (
        <div className="text-[12px] text-neutral-800 leading-normal whitespace-pre-line" dangerouslySetInnerHTML={{ __html: renderMarkdownHelper(skills) }} />
      )}
    </div>
  );

  const experiencesSection = ((experiences && experiences.length > 0) || isEditable) && (
    <div className="mb-3">
      <h2 className="text-[15px] font-bold text-black uppercase tracking-wider border-b border-neutral-350 pb-0.5 mb-1.5">Work Experience</h2>
      <div className="space-y-2">
        {experiences.map((exp, idx) => {
          const techStr = exp.technologies && exp.technologies.length > 0 ? (
            <div className="text-[11.5px] text-neutral-700 mt-0.5">
              <strong>Technologies:</strong> {exp.technologies.join(', ')}
            </div>
          ) : null;
          return (
            <div key={idx} className="text-[12.5px]">
              {isEditable ? (
                <div className="space-y-1 p-1.5 border border-dashed border-neutral-200 hover:border-neutral-300 rounded bg-neutral-50/30 transition-all mb-2">
                  <div className="flex justify-between font-bold text-black gap-2">
                    <input
                      type="text"
                      value={exp.title || ''}
                      placeholder="Job Title"
                      onChange={(e) => onUpdateField('experiences', e.target.value, idx, 'title')}
                      className="w-1/2 font-bold text-black bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                    <input
                      type="text"
                      value={exp.company || ''}
                      placeholder="Company"
                      onChange={(e) => onUpdateField('experiences', e.target.value, idx, 'company')}
                      className="w-1/4 font-bold text-black bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 text-right transition-all"
                    />
                    <input
                      type="text"
                      value={`${exp.startDate || ''}${exp.startDate || exp.endDate || exp.current ? ' - ' : ''}${exp.current ? 'Present' : (exp.endDate || '')}`}
                      placeholder="Dates"
                      onChange={(e) => {
                        const val = e.target.value;
                        const parts = val.split('-');
                        const start = parts[0]?.trim() || '';
                        const end = parts[1]?.trim() || '';
                        onUpdateField('experiences', start, idx, 'startDate');
                        if (end.toLowerCase() === 'present') {
                          onUpdateField('experiences', true, idx, 'current');
                          onUpdateField('experiences', '', idx, 'endDate');
                        } else {
                          onUpdateField('experiences', false, idx, 'current');
                          onUpdateField('experiences', end, idx, 'endDate');
                        }
                      }}
                      className="w-1/4 font-normal text-neutral-700 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 text-right transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-neutral-600 italic text-[11px] gap-2">
                    <input
                      type="text"
                      value={exp.employmentType || 'Full Time'}
                      placeholder="Employment Type"
                      onChange={(e) => onUpdateField('experiences', e.target.value, idx, 'employmentType')}
                      className="w-1/2 italic text-neutral-600 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                    <input
                      type="text"
                      value={exp.location || ''}
                      placeholder="Location"
                      onChange={(e) => onUpdateField('experiences', e.target.value, idx, 'location')}
                      className="w-1/2 italic text-neutral-600 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 text-right transition-all"
                    />
                  </div>
                  <div className="text-[11.5px] text-neutral-700 flex items-center gap-1">
                    <strong className="shrink-0">Technologies:</strong>
                    <input
                      type="text"
                      value={exp.technologies ? exp.technologies.join(', ') : ''}
                      placeholder="React, Node.js"
                      onChange={(e) => onUpdateField('experiences', e.target.value, idx, 'technologies')}
                      className="w-full text-neutral-700 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                  </div>
                  <textarea
                    value={exp.description || ''}
                    placeholder="Describe achievements..."
                    onChange={(e) => onUpdateField('experiences', e.target.value, idx, 'description')}
                    rows={exp.description ? exp.description.split('\n').length + 1 : 2}
                    className="w-full text-[12px] text-neutral-800 leading-normal bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded p-1 outline-none resize-none transition-all"
                  />
                  <div className="flex justify-end pr-1 pt-1">
                    <button
                      type="button"
                      onClick={() => onImproveField('experience', idx)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 text-[10px] text-indigo-650 hover:text-indigo-850 font-semibold bg-indigo-50 hover:bg-indigo-100/70 px-2 py-0.5 rounded transition-all"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Improve with AI</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between font-bold text-black">
                    <span>{exp.title} | {exp.company}</span>
                    <span className="font-normal text-neutral-700">{exp.startDate} &ndash; {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 italic text-[11px]">
                    <span>{exp.employmentType || 'Full Time'}{exp.location ? ` | ${exp.location}` : ''}</span>
                  </div>
                  {techStr}
                  {renderBulletsHelper(exp.description)}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const projectsSection = ((projects && projects.length > 0) || isEditable) && (
    <div className="mb-3">
      <h2 className="text-[15px] font-bold text-black uppercase tracking-wider border-b border-neutral-350 pb-0.5 mb-1.5">Projects</h2>
      <div className="space-y-2">
        {projects.map((proj, idx) => {
          const techList = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies;
          const links = [];
          if (proj.github) links.push(`<a href="${proj.github}" target="_blank" class="underline hover:text-neutral-600">GitHub</a>`);
          if (proj.live) links.push(`<a href="${proj.live}" target="_blank" class="underline hover:text-neutral-600">Live Demo</a>`);

          let combinedDesc = proj.description || '';
          if (proj.highlights && proj.highlights.length > 0) {
            combinedDesc += '\n' + proj.highlights.join('\n');
          }

          return (
            <div key={idx} className="text-[12.5px]">
              {isEditable ? (
                <div className="space-y-1 p-1.5 border border-dashed border-neutral-200 hover:border-neutral-300 rounded bg-neutral-50/30 transition-all mb-2">
                  <div className="flex justify-between font-bold text-black gap-2">
                    <input
                      type="text"
                      value={proj.title || ''}
                      placeholder="Project Title"
                      onChange={(e) => onUpdateField('projects', e.target.value, idx, 'title')}
                      className="w-1/2 font-bold text-black bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                    <input
                      type="text"
                      value={proj.role || ''}
                      placeholder="Role (e.g. Lead)"
                      onChange={(e) => onUpdateField('projects', e.target.value, idx, 'role')}
                      className="w-1/4 font-bold text-black bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 text-right transition-all"
                    />
                    <input
                      type="text"
                      value={`${proj.startDate || ''}${proj.startDate || proj.endDate || proj.current ? ' - ' : ''}${proj.current ? 'Present' : (proj.endDate || '')}`}
                      placeholder="Dates"
                      onChange={(e) => {
                        const val = e.target.value;
                        const parts = val.split('-');
                        const start = parts[0]?.trim() || '';
                        const end = parts[1]?.trim() || '';
                        onUpdateField('projects', start, idx, 'startDate');
                        if (end.toLowerCase() === 'present') {
                          onUpdateField('projects', true, idx, 'current');
                          onUpdateField('projects', '', idx, 'endDate');
                        } else {
                          onUpdateField('projects', false, idx, 'current');
                          onUpdateField('projects', end, idx, 'endDate');
                        }
                      }}
                      className="w-1/4 font-normal text-neutral-700 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 text-right transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-neutral-600 text-[11px] gap-2">
                    <input
                      type="text"
                      value={proj.github || ''}
                      placeholder="GitHub Link"
                      onChange={(e) => onUpdateField('projects', e.target.value, idx, 'github')}
                      className="w-1/2 text-neutral-600 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                    <input
                      type="text"
                      value={proj.live || ''}
                      placeholder="Live Demo Link"
                      onChange={(e) => onUpdateField('projects', e.target.value, idx, 'live')}
                      className="w-1/2 text-neutral-600 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 text-right transition-all"
                    />
                  </div>
                  <div className="text-[11.5px] text-neutral-700 flex items-center gap-1">
                    <strong className="shrink-0">Tech Stack:</strong>
                    <input
                      type="text"
                      value={techList || ''}
                      placeholder="React, Node.js"
                      onChange={(e) => onUpdateField('projects', e.target.value, idx, 'technologies')}
                      className="w-full text-neutral-700 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                  </div>
                  <textarea
                    value={combinedDesc || ''}
                    placeholder="Project details..."
                    onChange={(e) => onUpdateField('projects', e.target.value, idx, 'description')}
                    rows={combinedDesc ? combinedDesc.split('\n').length + 1 : 2}
                    className="w-full text-[12px] text-neutral-800 leading-normal bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded p-1 outline-none resize-none transition-all"
                  />
                  <div className="flex justify-end pr-1 pt-1">
                    <button
                      type="button"
                      onClick={() => onImproveField('project', idx)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 text-[10px] text-indigo-650 hover:text-indigo-850 font-semibold bg-indigo-50 hover:bg-indigo-100/70 px-2 py-0.5 rounded transition-all"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Improve with AI</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between font-bold text-black">
                    <span>
                      {proj.title}
                      {proj.role ? ` (${proj.role})` : ''}
                      {links.length > 0 && (
                        <span className="font-normal text-[10px] text-neutral-500 ml-2" dangerouslySetInnerHTML={{ __html: `[ ${links.join(' | ')} ]` }} />
                      )}
                    </span>
                    <span className="font-normal text-neutral-700">{proj.startDate} &ndash; {proj.current ? 'Present' : proj.endDate}</span>
                  </div>
                  {techList && (
                    <div className="text-[11.5px] text-neutral-700 mt-0.5">
                      <strong>Tech Stack:</strong> {techList}
                    </div>
                  )}
                  {renderBulletsHelper(combinedDesc)}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const educationSection = ((educations && educations.length > 0) || isEditable) && (
    <div className="mb-3">
      <h2 className="text-[15px] font-bold text-black uppercase tracking-wider border-b border-neutral-350 pb-0.5 mb-1.5">Education</h2>
      <div className="space-y-2">
        {educations.map((edu, idx) => {
          const fieldStr = edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '';
          const cgpaStr = edu.cgpa ? ` | CGPA: ${edu.cgpa}` : '';
          return (
            <div key={idx} className="text-[12.5px]">
              {isEditable ? (
                <div className="space-y-1 p-1.5 border border-dashed border-neutral-200 hover:border-neutral-300 rounded bg-neutral-50/30 transition-all mb-2">
                  <div className="flex justify-between font-bold text-black gap-2">
                    <input
                      type="text"
                      value={edu.school || ''}
                      placeholder="School"
                      onChange={(e) => onUpdateField('educations', e.target.value, idx, 'school')}
                      className="w-2/3 font-bold text-black bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                    <input
                      type="text"
                      value={`${edu.startDate || ''}${edu.startDate || edu.endDate || edu.current ? ' - ' : ''}${edu.current ? 'Present' : (edu.endDate || '')}`}
                      placeholder="Dates"
                      onChange={(e) => {
                        const val = e.target.value;
                        const parts = val.split('-');
                        const start = parts[0]?.trim() || '';
                        const end = parts[1]?.trim() || '';
                        onUpdateField('educations', start, idx, 'startDate');
                        if (end.toLowerCase() === 'present') {
                          onUpdateField('educations', true, idx, 'current');
                          onUpdateField('educations', '', idx, 'endDate');
                        } else {
                          onUpdateField('educations', false, idx, 'current');
                          onUpdateField('educations', end, idx, 'endDate');
                        }
                      }}
                      className="w-1/3 font-normal text-neutral-700 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 text-right transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-neutral-600 text-[11px] gap-2">
                    <input
                      type="text"
                      value={edu.degree || ''}
                      placeholder="Degree"
                      onChange={(e) => onUpdateField('educations', e.target.value, idx, 'degree')}
                      className="w-1/3 text-neutral-600 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                    <input
                      type="text"
                      value={edu.fieldOfStudy || ''}
                      placeholder="Field of Study"
                      onChange={(e) => onUpdateField('educations', e.target.value, idx, 'fieldOfStudy')}
                      className="w-1/3 text-neutral-600 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
                    />
                    <input
                      type="text"
                      value={edu.cgpa || ''}
                      placeholder="CGPA / Grade"
                      onChange={(e) => onUpdateField('educations', e.target.value, idx, 'cgpa')}
                      className="w-1/3 text-neutral-650 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 text-right transition-all"
                    />
                  </div>
                  <textarea
                    value={edu.description || ''}
                    placeholder="Education details..."
                    onChange={(e) => onUpdateField('educations', e.target.value, idx, 'description')}
                    rows={edu.description ? edu.description.split('\n').length + 1 : 2}
                    className="w-full text-[12px] text-neutral-800 leading-normal bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded p-1 outline-none resize-none transition-all"
                  />
                  <div className="flex justify-end pr-1 pt-1">
                    <button
                      type="button"
                      onClick={() => onImproveField('education', idx)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 text-[10px] text-indigo-650 hover:text-indigo-850 font-semibold bg-indigo-50 hover:bg-indigo-100/70 px-2 py-0.5 rounded transition-all"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Improve with AI</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between font-bold text-black">
                    <span>{edu.school}</span>
                    <span className="font-normal text-neutral-700">{edu.startDate} &ndash; {edu.current ? 'Present' : edu.endDate}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 text-[11px]">
                    <span>{edu.degree}{fieldStr}{cgpaStr}</span>
                  </div>
                  {renderBulletsHelper(edu.description)}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white border border-neutral-200 shadow-2xl p-[0.6in] text-left text-black font-sans select-text flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="text-center mb-4">
          {isEditable ? (
            <input
              type="text"
              value={resumeName || user?.name || 'Resume'}
              onChange={(e) => onUpdateField('name', e.target.value)}
              className="w-full text-center text-[32px] font-extrabold text-black tracking-tight leading-none mb-1 bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none px-1 transition-all"
            />
          ) : (
            <h1 className="text-[32px] font-extrabold text-black tracking-tight leading-none mb-1">
              {resumeName || user?.name || 'Resume'}
            </h1>
          )}
          {roleTitle && (
            <div className="text-[13px] font-bold text-neutral-700 uppercase tracking-widest mb-1.5">
              {roleTitle}
            </div>
          )}
          {isEditable ? (
            <div className="flex flex-wrap justify-center items-center gap-1.5 text-[11.5px] text-neutral-600 mb-1.5">
              <input
                type="text"
                value={contactInfo?.email || ''}
                placeholder="Email"
                onChange={(e) => onUpdateField('contactInfo', e.target.value, null, 'email')}
                className="w-36 text-center bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none py-0.5 px-0.5"
              />
              <span>|</span>
              <input
                type="text"
                value={contactInfo?.mobile || ''}
                placeholder="Phone"
                onChange={(e) => onUpdateField('contactInfo', e.target.value, null, 'mobile')}
                className="w-28 text-center bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none py-0.5 px-0.5"
              />
              <span>|</span>
              <input
                type="text"
                value={contactInfo?.linkedin || ''}
                placeholder="LinkedIn URL"
                onChange={(e) => onUpdateField('contactInfo', e.target.value, null, 'linkedin')}
                className="w-44 text-center bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none py-0.5 px-0.5"
              />
              <span>|</span>
              <input
                type="text"
                value={contactInfo?.github || ''}
                placeholder="GitHub URL"
                onChange={(e) => onUpdateField('contactInfo', e.target.value, null, 'github')}
                className="w-44 text-center bg-transparent border border-dashed border-transparent hover:border-neutral-300 focus:border-indigo-500 focus:bg-neutral-50/50 rounded outline-none py-0.5 px-0.5"
              />
            </div>
          ) : (
            <div
              className="text-[11.5px] text-neutral-600 space-x-1"
              dangerouslySetInnerHTML={{ __html: contactLine }}
            />
          )}
        </div>

        {isExperienced ? (
          <>
            {summarySection}
            {experiencesSection}
            {projectsSection}
            {skillsSection}
            {educationSection}
          </>
        ) : (
          <>
            {summarySection}
            {skillsSection}
            {projectsSection}
            {experiencesSection}
            {educationSection}
          </>
        )}
      </div>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default ResumeBuilderPage;
