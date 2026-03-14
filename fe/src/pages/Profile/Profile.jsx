// fe/src/pages/Profile.jsx (hoặc fe/src/pages/Profile/Profile.jsx)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import { getProfileApi } from "../../api/profileApi";
import { getRecentActivitiesApi } from "../../api/taskApi"; // Dùng API hoạt động có sẵn

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, activitiesRes] = await Promise.all([
          getProfileApi(),
          getRecentActivitiesApi()
        ]);
        setProfile(profileRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="h-screen flex flex-col bg-slate-50"><Header /><div className="flex flex-1"><Sidebar /><div className="flex-1 flex items-center justify-center text-slate-500 font-medium">Loading profile...</div></div></div>;
  if (!profile) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* BANNER ẢO */}
          <div className="h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-8 relative shadow-sm"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: IDENTIFICATION */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center relative pt-16">
                {/* AVATAR VƯỢT LÊN TRÊN */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                  <img
                    src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&size=150`}
                    alt="avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mt-2">{profile.fullName}</h1>
                <p className="text-sm font-semibold text-blue-600 mt-1 uppercase tracking-wider">{profile.jobTitle || "Team Member"}</p>
                
                {profile.location && (
                  <p className="text-sm text-slate-500 mt-3 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {profile.location}
                  </p>
                )}

                {/* NÚT EDIT SETTINGS DÀNH CHO CHÍNH CHỦ */}
                <div className="mt-8 w-full">
                  <Link to="/settings" className="w-full flex items-center justify-center bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Manage account
                  </Link>
                </div>
              </div>

              {/* CONTACT INFO CARD */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-slate-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Email</p>
                      <p className="text-sm font-medium text-slate-800">{profile.email}</p>
                    </div>
                  </div>
                  {profile.phone && (
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-slate-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Phone</p>
                        <p className="text-sm font-medium text-slate-800">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: BIO & ACTIVITY */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* ABOUT ME */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4">About</h2>
                {profile.bio ? (
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                ) : (
                  <p className="text-slate-400 text-sm italic">This user hasn't added a bio yet.</p>
                )}
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h2>
                
                <div className="space-y-6">
                  {activities.length > 0 ? (
                    activities.slice(0, 5).map((act, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold text-slate-900">{profile.fullName}</span> {act.action} <span className="font-semibold text-slate-800">{act.taskTitle}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(act.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-sm italic border-l-2 border-slate-200 pl-4">No recent activity.</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}