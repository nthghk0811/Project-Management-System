// fe/src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { getProfileApi, updateProfileApi, changePasswordApi, uploadAvatarApi } from "../api/profileApi"; // Nhớ import hàm mới

export default function Settings() {
  const [profile, setProfile] = useState(null);
 const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [activeTab, setActiveTab] = useState("profile");
  const [skillInput, setSkillInput] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false); // State Loading cho Avatar
  const navigate = useNavigate();

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  
  // States cho Preferences (Đã dọn dẹp sạch sẽ)
  const [emailNoti, setEmailNoti] = useState(true);
  const [marketingEmail, setMarketingEmail] = useState(false);

  const TABS = [
    { id: "profile", label: "Profile & visibility", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "security", label: "Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { id: "preferences", label: "Preferences", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfileApi();
      const data = res.data;

      let parsedSkills = [];
      if (Array.isArray(data.skills)) {
        parsedSkills = data.skills;
      } else if (typeof data.skills === "string" && data.skills.trim() !== "") {
        parsedSkills = data.skills.split(",").map(s => s.trim());
      }

      setProfile({ ...data, skills: parsedSkills });
    } catch (error) { console.error(error); }
  };

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!profile.skills.includes(skillInput.trim())) {
        setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // ==== LOGIC UPLOAD ẢNH MỚI ====
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng sơ bộ (chỉ nhận ảnh)
    if (!file.type.startsWith("image/")) {
      return showToast("Please select a valid image file.");
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploadingAvatar(true);
      const res = await uploadAvatarApi(formData);
      
      // Update local profile state để hiển thị ảnh mới ngay lập tức
      setProfile({ ...profile, avatar: res.data.user.avatar });
      
      // Cập nhật LocalStorage để Header cũng nhảy ảnh theo
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));
      
      showToast("Avatar updated successfully!");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to upload avatar");
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

      setTimeout(() => {
        navigate("/profile");
      }, 700);

    } catch (err) {
      showToast(err.response?.data?.message || "Update profile failed");
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) return showToast("Please fill in both password fields");
    try {
      await changePasswordApi(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      showToast("Password changed successfully");
    } catch (err) { showToast(err.response?.data?.message || "Change password failed"); }
  };

  if (!profile) return <div className="h-screen flex items-center justify-center text-slate-500">Loading settings...</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col relative">
      <Header />
   
      {toast.show && (
        <div className={`fixed top-20 right-8 text-white px-6 py-3 rounded-lg shadow-2xl z-[100] animate-fade-in-up font-semibold text-sm flex items-center ${toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'}`}>
          {toast.type === 'error' ? (
             <svg className="w-5 h-5 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
             <svg className="w-5 h-5 mr-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your account details and preferences.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-64 flex-shrink-0">
              <nav className="flex flex-col space-y-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.id ? "bg-white shadow-sm border border-slate-200 text-blue-700" : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 border border-transparent"
                    }`}
                  >
                    <svg className={`w-5 h-5 ${activeTab === tab.id ? "text-blue-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path>
                    </svg>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-4xl">
              
              {/* TAB 1: PROFILE */}
              {activeTab === "profile" && (
                <div className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Profile & visibility</h2>
                  
                  {/* TÁCH RIÊNG PHẦN AVATAR KHỎI FORM CHÍNH */}
                  <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-slate-100">
                    <div className="relative">
                      <img 
                        src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&size=100`} 
                        alt="Profile" 
                        className={`w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm transition-opacity ${isUploadingAvatar ? 'opacity-50' : 'opacity-100'}`} 
                      />
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-800 mb-1">Profile Picture</h3>
                      <p className="text-xs text-slate-500 mb-3">PNG, JPG or WEBP under 5MB</p>
                      
                      {/* NÚT UPLOAD ẨN INPUT */}
                      <input 
                        type="file" 
                        id="avatar-upload" 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden" 
                        onChange={handleAvatarUpload} 
                        disabled={isUploadingAvatar}
                      />
                      <label 
                        htmlFor="avatar-upload" 
                        className={`inline-block px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-200 transition ${isUploadingAvatar ? 'pointer-events-none opacity-70' : ''}`}
                      >
                        {isUploadingAvatar ? 'Uploading...' : 'Upload New Image'}
                      </label>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label><input name="fullName" value={profile.fullName || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm font-semibold text-slate-800" /></div>
                      <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Job Title</label><input name="jobTitle" value={profile.jobTitle || ""} onChange={handleChange} placeholder="e.g. Senior Frontend Developer" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm font-semibold text-slate-800" /></div>
                      <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Phone Number</label><input name="phone" value={profile.phone || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm font-semibold text-slate-800" /></div>
                      <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Location</label><input name="location" value={profile.location || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm font-semibold text-slate-800" /></div>
                    </div>

                    <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Bio</label><textarea name="bio" rows="4" value={profile.bio || ""} onChange={handleChange} placeholder="Tell us a bit about yourself..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm resize-none font-medium text-slate-700"></textarea></div>
                    
                    <div className="pt-2">
                      <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Skills & Expertise</label>
                      <div className="p-3 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition bg-white min-h-[52px] flex flex-wrap gap-2 items-center shadow-sm">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center shadow-sm">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-blue-400 hover:text-blue-800 focus:outline-none transition">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleAddSkill}
                          placeholder={profile.skills.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
                          className="flex-1 bg-transparent border-none outline-none text-sm min-w-[150px] p-1 text-slate-700 font-medium"
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400 mt-2">Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-[10px] text-slate-600 mx-1">Enter</kbd> to add a skill to your profile.</p>
                    </div>

                    <div className="pt-6 flex justify-end border-t border-slate-100">
                      <button type="submit" className="bg-[#0b57d0] text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm transition active:scale-95">
                        Save changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: SECURITY */}
              {activeTab === "security" && (
                <div className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Security Settings</h2>
                  <p className="text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">Update your password to keep your account secure.</p>
                  <form onSubmit={handleSavePassword} className="space-y-6 max-w-md">
                    <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Current Password</label><input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm font-semibold text-slate-800" /></div>
                    <div><label className="block text-[13px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">New Password</label><input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm font-semibold text-slate-800" /></div>
                    <div className="pt-4"><button type="submit" className="bg-slate-800 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 shadow-sm transition active:scale-95">Update password</button></div>
                  </form>
                </div>
              )}

              {/* TAB 3: PREFERENCES (Đã tối giản) */}
              {activeTab === "preferences" && (
                <div className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Preferences</h2>
                  <p className="text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">Manage your communication and notification settings.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-slate-50">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Email Notifications</h4>
                        <p className="text-xs text-slate-500 mt-1">Receive project updates and task assignments via email.</p>
                      </div>
                      <button onClick={() => setEmailNoti(!emailNoti)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNoti ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNoti ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-slate-50">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Marketing & Promos</h4>
                        <p className="text-xs text-slate-500 mt-1">Receive occasional product updates and offers.</p>
                      </div>
                      <button onClick={() => setMarketingEmail(!marketingEmail)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${marketingEmail ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${marketingEmail ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
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