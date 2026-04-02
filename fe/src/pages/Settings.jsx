import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { getProfileApi, updateProfileApi, changePasswordApi, uploadAvatarApi } from "../api/profileApi";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [activeTab, setActiveTab] = useState("profile");
  const [skillInput, setSkillInput] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [emailNoti, setEmailNoti] = useState(true);
  const [marketingEmail, setMarketingEmail] = useState(false);

  const TABS = [
    { id: "profile", label: "Profile Identity", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "security", label: "Access & Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { id: "preferences", label: "Preferences", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfileApi();
      const data = res.data;
      let parsedSkills = [];
      if (Array.isArray(data.skills)) parsedSkills = data.skills;
      else if (typeof data.skills === "string" && data.skills.trim() !== "") parsedSkills = data.skills.split(",").map(s => s.trim());
      setProfile({ ...data, skills: parsedSkills });
    } catch (error) { console.error(error); }
  };

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!profile.skills.includes(skillInput.trim())) setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("Please select a valid image file.", "error");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploadingAvatar(true);
      const res = await uploadAvatarApi(formData);
      setProfile({ ...profile, avatar: res.data.user.avatar });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));
      showToast("Avatar updated successfully!");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to upload avatar", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfileApi(profile);
      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("storage"));
      showToast("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 700);
    } catch (err) {
      showToast(err.response?.data?.message || "Update profile failed", "error");
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) return showToast("Fields required", "error");
    try {
      await changePasswordApi(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      showToast("Password updated securely.");
    } catch (err) { showToast(err.response?.data?.message || "Verification failed", "error"); }
  };

  if (!profile) return <div className="h-screen flex items-center justify-center bg-[#FAFAFA]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2559]"></div></div>;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans flex flex-col relative selection:bg-blue-100 selection:text-blue-900">
      <Header />
   
      {toast.show && (
        <div className={`fixed top-20 right-8 text-white px-5 py-3 rounded-lg shadow-xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center border border-slate-700 ${toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'}`}>
          <div className={`w-2 h-2 rounded-full mr-3 animate-pulse ${toast.type === 'error' ? 'bg-white' : 'bg-emerald-400'}`}></div>
          {toast.message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="mb-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold text-[#1B2559] tracking-tight">Configuration</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage your workspace identity and security parameters.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Cột Tabs */}
            <div className="w-full lg:w-56 flex-shrink-0">
              <nav className="flex flex-col space-y-1 sticky top-0">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                      activeTab === tab.id ? "bg-white border-slate-200 shadow-sm text-[#1B2559]" : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <svg className={`w-4 h-4 ${activeTab === tab.id ? "text-[#0b57d0]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path>
                    </svg>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Cột Nội dung (Chia làm nhiều Card để lấp không gian) */}
            <div className="flex-1 space-y-6">
              
              {/* TAB 1: PROFILE */}
              {activeTab === "profile" && (
                <div className="animate-fade-in-up space-y-6">
                  
                  {/* Card 1: Avatar */}
                  <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-[#1B2559] tracking-tight">Avatar</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">Click on the avatar to customize.</p>
                    </div>
                    <div className="p-6 bg-slate-50/50 flex items-center space-x-6">
                      <div className="relative group cursor-pointer" onClick={() => !isUploadingAvatar && document.getElementById('avatar-upload').click()}>
                        <img 
                          src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&size=100`} 
                          alt="Profile" 
                          className={`w-20 h-20 rounded-full object-cover border border-slate-200 transition-all ${isUploadingAvatar ? 'opacity-50' : 'group-hover:opacity-80 group-hover:ring-4 group-hover:ring-blue-100'}`} 
                        />
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                            <svg className="animate-spin h-5 w-5 text-[#1B2559]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          </div>
                        )}
                        <input type="file" id="avatar-upload" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Upload new avatar</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">JPG, PNG or WEBP. Max 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Card 2: General Info */}
                    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                      <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-[#1B2559] tracking-tight">General Information</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Basic info used to identify you in the workspace.</p>
                      </div>
                      <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label><input name="fullName" required value={profile.fullName || ""} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1B2559] outline-none transition text-sm font-semibold text-slate-800" /></div>
                          <div><label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Job Role</label><input name="jobTitle" value={profile.jobTitle || ""} onChange={handleChange} placeholder="e.g. Lead Engineer" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1B2559] outline-none transition text-sm font-semibold text-slate-800" /></div>
                          <div><label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Contact Number</label><input name="phone" value={profile.phone || ""} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1B2559] outline-none transition text-sm font-semibold text-slate-800" /></div>
                          <div><label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Location</label><input name="location" value={profile.location || ""} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1B2559] outline-none transition text-sm font-semibold text-slate-800" /></div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Bio & Skills */}
                    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                      <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-[#1B2559] tracking-tight">Professional Details</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Your background and technical expertise.</p>
                      </div>
                      <div className="p-6 space-y-5">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">About</label>
                          <textarea name="bio" rows="3" value={profile.bio || ""} onChange={handleChange} placeholder="Brief background..." className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1B2559] outline-none transition text-sm resize-none font-medium text-slate-800"></textarea>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Technical Stack</label>
                          <div className="p-2 border border-slate-200 rounded-lg focus-within:border-[#1B2559] transition bg-white min-h-[42px] flex flex-wrap gap-1.5 items-center">
                            {profile.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center">
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="ml-1.5 text-slate-400 hover:text-rose-500 transition">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                              </span>
                            ))}
                            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder="Type & Enter..." className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] px-1 text-slate-800 font-medium" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button type="submit" className="bg-[#1B2559] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition active:scale-95">Save Changes</button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: SECURITY */}
              {activeTab === "security" && (
                <div className="animate-fade-in-up">
                  <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-[#1B2559] tracking-tight">Change Password</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">Update your password to keep your account secure.</p>
                    </div>
                    <form onSubmit={handleSavePassword}>
                      <div className="p-6 space-y-5 max-w-md">
                        <div><label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Current Password</label><input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1B2559] outline-none transition text-sm font-semibold text-slate-800" /></div>
                        <div><label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label><input type="password" required minLength={6} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1B2559] outline-none transition text-sm font-semibold text-slate-800" /></div>
                      </div>
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button type="submit" className="bg-rose-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-rose-700 transition active:scale-95">Enforce Password</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 3: PREFERENCES */}
              {activeTab === "preferences" && (
                <div className="animate-fade-in-up">
                  <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-[#1B2559] tracking-tight">System Alerts</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">Control the noise level of workspace notifications.</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Operational Emails</h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Task assignments, status changes, and mentions.</p>
                        </div>
                        <button onClick={() => setEmailNoti(!emailNoti)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${emailNoti ? 'bg-[#0b57d0]' : 'bg-slate-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${emailNoti ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-6">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Feature Updates</h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Changelogs, new tools, and platform announcements.</p>
                        </div>
                        <button onClick={() => setMarketingEmail(!marketingEmail)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${marketingEmail ? 'bg-[#0b57d0]' : 'bg-slate-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${marketingEmail ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}