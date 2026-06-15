import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import {
  User,
  Shield,
  X,
  Plus,
  MoreHorizontal,
  Check,
  AlertCircle,
  Key,
  Briefcase
} from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', or 'career'

  // Profile Form States
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  // Security Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Professional / Career Info States
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');

  // Status/Error States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setEmailInput(user.email || '');
    }
  }, [user, isOpen]);

  // Fetch career profile data when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchProfessionalProfile = async () => {
        try {
          const res = await axiosInstance.get('/profile');
          if (res.data) {
            setIndustry(res.data.industry || '');
            setExperience(res.data.experience || '');
            setSkills(Array.isArray(res.data.skills) ? res.data.skills.join(', ') : res.data.skills || '');
            setBio(res.data.bio || '');
          }
        } catch (err) {
          console.error('Failed to fetch professional profile:', err);
        }
      };
      fetchProfessionalProfile();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axiosInstance.put('/auth/profile', {
        name: nameInput,
        email: emailInput
      });

      updateUser({
        name: res.data.name,
        email: res.data.email
      });

      setSuccess('Profile updated successfully!');
      setIsEditingName(false);
      setIsEditingEmail(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put('/auth/password', {
        oldPassword,
        newPassword
      });

      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCareerProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        bio,
        skills,
        experience: Number(experience) || 0,
        industry,
        education: [],
        linkedinUrl: '',
        githubUrl: '',
        careerGoals: bio.slice(0, 100)
      };

      const res = await axiosInstance.post('/profile', payload);

      if (res.data && (!user || !user.profileCompleted)) {
        updateUser({ profileCompleted: true });
      }

      setSuccess('Career profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update career profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div
        className="w-full max-w-4xl h-[600px] bg-white text-neutral-900 rounded-2xl shadow-2xl flex overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <aside className="w-64 bg-neutral-50/80 border-r border-neutral-100 p-6 flex flex-col justify-between select-none">
          <div className="flex flex-col">
            {/* Header */}
            <div>
              <h2 className="font-bold text-xl text-neutral-800 tracking-tight">Account</h2>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Manage your account info.</p>
            </div>

            {/* Nav Menu */}
            <nav className="mt-8 space-y-1">
              <button
                onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${activeTab === 'profile'
                    ? 'bg-neutral-200/60 text-neutral-900 font-semibold shadow-sm'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}
                `}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => { setActiveTab('career'); setError(''); setSuccess(''); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${activeTab === 'career'
                    ? 'bg-neutral-200/60 text-neutral-900 font-semibold shadow-sm'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}
                `}
              >
                <Briefcase className="w-4 h-4" />
                <span>Career Profile</span>
              </button>
              <button
                onClick={() => { setActiveTab('security'); setError(''); setSuccess(''); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${activeTab === 'security'
                    ? 'bg-neutral-200/60 text-neutral-900 font-semibold shadow-sm'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}
                `}
              >
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </button>
            </nav>
          </div>

        </aside>

        {/* Right Main Panel */}
        <main className="flex-1 p-8 flex flex-col justify-between relative bg-white overflow-y-auto">
          {/* Close button in top-right */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-800 transition-all cursor-pointer animate-none"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Tab Contents */}
          <div className="flex-1">
            {activeTab === 'profile' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 tracking-tight">Profile details</h3>
                  <div className="h-px bg-neutral-100 w-full mt-3"></div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Profile row */}
                <div className="flex py-4 items-center border-b border-neutral-100">
                  <div className="text-xs font-semibold text-neutral-500 w-1/4">Profile</div>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg border border-emerald-500 shadow-sm select-none uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    {isEditingName ? (
                      <form onSubmit={handleUpdateProfile} className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-800 w-48"
                          required
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-neutral-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingName(false)}
                          className="border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 transition-all"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-bold text-neutral-800 uppercase tracking-wide">{user?.name}</span>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="text-xs font-semibold text-neutral-600 hover:text-black hover:underline cursor-pointer"
                        >
                          Update profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email addresses row */}
                <div className="flex py-4 items-start border-b border-neutral-100">
                  <div className="text-xs font-semibold text-neutral-500 w-1/4 mt-1">Email addresses</div>
                  <div className="flex-1 space-y-3">
                    {isEditingEmail ? (
                      <form onSubmit={handleUpdateProfile} className="flex items-center gap-2 w-full">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-800 w-64"
                          required
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-neutral-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingEmail(false)}
                          className="border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 transition-all"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-700">{user?.email}</span>
                          <span className="bg-neutral-100 text-neutral-600 border border-neutral-200/80 rounded px-1.5 py-0.5 text-[9px] font-bold shadow-sm">
                            Primary
                          </span>
                        </div>
                        <button className="text-neutral-400 hover:text-neutral-700 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {!isEditingEmail && (
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add email address</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Connected accounts row */}
                <div className="flex py-4 items-center">
                  <div className="text-xs font-semibold text-neutral-500 w-1/4">Connected accounts</div>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shadow-sm rounded-full" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.39 3.67 1.5 7.56l3.87 3C6.31 7.56 8.94 5.04 12 5.04z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.11 2.73-2.36 3.57l3.66 2.84c2.14-1.97 3.37-4.87 3.37-8.56z" />
                        <path fill="#FBBC05" d="M5.37 10.56c-.24-.72-.37-1.48-.37-2.27s.13-1.55.37-2.27L1.5 3.02C.54 4.93 0 7.08 0 9.35c0 2.27.54 4.42 1.5 6.33l3.87-3.12z" />
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.06 0-5.69-2.52-6.63-5.52l-3.87 3c1.89 3.89 5.85 6.56 10.5 6.56z" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-700">Google • {user?.email}</span>
                    </div>
                    <button className="text-neutral-400 hover:text-neutral-700 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'career' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 tracking-tight">Career Profile</h3>
                  <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Manage your industry, experience, skills, and bio.</p>
                  <div className="h-px bg-neutral-100 w-full mt-3"></div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateCareerProfile} className="space-y-4 max-w-xl">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-600">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-850 bg-white"
                      required
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

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-600">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-800 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-600">Skills</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g., Python, JavaScript, Project Management"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-800 bg-white"
                      required
                    />
                    <span className="block text-[10px] text-neutral-400 font-medium">
                      Separate multiple skills with commas
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-600">Professional Bio</label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about your professional background..."
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-800 bg-white resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-neutral-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    {loading ? 'Saving...' : 'Save Career Profile'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 tracking-tight">Security Settings</h3>
                  <div className="h-px bg-neutral-100 w-full mt-3"></div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-600">Old Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-800"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-600">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-800"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-600">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-500 text-neutral-800"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-neutral-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    {loading ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
