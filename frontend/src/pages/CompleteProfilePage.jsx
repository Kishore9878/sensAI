import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { Sparkles, LayoutGrid, ChevronDown } from 'lucide-react';

const CompleteProfilePage = () => {
  const { user, setProfileCompleted } = useAuth();
  const navigate = useNavigate();

  // Basic Form States matching the screenshot
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!industry) {
      setError('Please select an industry.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        bio,
        skills,
        experience: Number(experience) || 0,
        industry,
        role,
        education: [],
        linkedinUrl: '',
        githubUrl: '',
        careerGoals: bio.slice(0, 100) // Default goal matching bio snippet
      };

      await axiosInstance.post('/profile', payload);
      
      // Update local context
      setProfileCompleted(true);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
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

            <div className="w-8 h-8 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </header>

      {/* Main Profile Form Wrapper */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="w-full max-w-lg bg-[#09090b] border border-neutral-800 rounded-xl p-8 shadow-2xl">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Complete Your Profile</h1>
            <p className="mt-2 text-xs text-neutral-400 font-medium">
              Select your industry to get personalized career insights and recommendations.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-800/40 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
             {/* Industry field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-200">Industry</label>
              <select
                value={industry}
                required
                onChange={(e) => setIndustry(e.target.value)}
                className="block w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-600 transition-colors"
              >
                <option value="" disabled>Select an industry</option>
                <option value="tech-software-development">Tech - Software Development</option>
                <option value="tech-data-science">Tech - Data Science & AI</option>
                <option value="finance-investment-banking">Finance - Investment Banking</option>
                <option value="finance-accounting">Finance - Accounting</option>
                <option value="healthcare-administration">Healthcare - Administration</option>
                <option value="healthcare-clinical">Healthcare - Clinical</option>
                <option value="marketing-digital">Marketing - Digital Marketing</option>
                <option value="education-teaching">Education - Teaching</option>
              </select>
            </div>

            {/* Target Role field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-200">Target Role</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Software Engineer, Marketing Analyst"
                className="block w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>

            {/* Years of Experience field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-200">Years of Experience</label>
              <input
                type="number"
                required
                min="0"
                max="50"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Enter years of experience"
                className="block w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>

            {/* Skills field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-200">Skills</label>
              <input
                type="text"
                required
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Python, JavaScript, Project Management"
                className="block w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              />
              <span className="block text-[10px] text-neutral-500 font-medium">
                Separate multiple skills with commas
              </span>
            </div>

            {/* Bio field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-200">Professional Bio</label>
              <textarea
                required
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your professional background..."
                className="block w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Complete Profile'
                )}
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
};

export default CompleteProfilePage;
