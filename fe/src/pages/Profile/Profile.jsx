// fe/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import { getProfileApi } from "../../api/profileApi";
import { getRecentActivitiesApi, getTaskStatisticsApi, getPerformanceDataApi } from "../../api/taskApi"; 
import { getMyProjectsApi } from "../../api/projectApi"; // Lấy API đếm dự án

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ tasksDone: 0, projects: 0, hoursLogged: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [profileRes, activitiesRes, projectsRes, statsRes, perfRes] = await Promise.all([
          getProfileApi(),
          getRecentActivitiesApi(),
          getMyProjectsApi(),
          getTaskStatisticsApi(),
          getPerformanceDataApi()
        ]);

        setProfile(profileRes.data);
        setActivities(activitiesRes.data);

        // TÍNH TOÁN DATA THẬT CHO BẢNG STATS
        // 1. Số dự án đang tham gia
        const projectsCount = projectsRes.data?.length || 0;
        
        // 2. Số task đã Done (tìm trong mảng statusStats)
        const doneStatus = statsRes.data?.statusStats?.find(s => s.name === "Done" || s.name === "Completed");
        const tasksDoneCount = doneStatus ? doneStatus.value : 0;
        
        // 3. Tổng số giờ đã log (Cộng tổng value trong workLogData)
        const hoursCount = perfRes.data?.workLogData?.reduce((sum, item) => sum + item.value, 0) || 0;

        setStats({
          tasksDone: tasksDoneCount,
          projects: projectsCount,
          hoursLogged: parseFloat(hoursCount.toFixed(2)) // Làm tròn 2 chữ số
        });

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

  // Lấy danh sách skills từ DB, nếu không có thì để mảng rỗng
  const userSkills = profile.skills || [];

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* BANNER ẢO */}
          <div className="h-48 w-full bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center rounded-2xl mb-8 relative shadow-sm">
             <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/40 rounded-2xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-2 sm:px-4 -mt-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: IDENTIFICATION & STATS */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center relative pt-16">
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                  <img
                    src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&size=150`}
                    alt="avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mt-2">{profile.fullName}</h1>
                
                {profile.role === 'admin' ? (
                  <p className="text-sm font-bold text-rose-600 mt-2 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                    Leader
                  </p>
                ) : (
                  <p className="text-sm font-bold text-blue-600 mt-2 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                    Team Member
                  </p>
                )}
                
                {profile.location && (
                  <p className="text-sm text-slate-500 mt-4 flex items-center justify-center bg-slate-50 w-full py-2 rounded-lg">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {profile.location}
                  </p>
                )}

                <div className="mt-6 w-full">
                  <Link to="/settings" className="w-full flex items-center justify-center bg-white border-2 border-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-200 transition shadow-sm">
                    Edit Profile
                  </Link>
                </div>
              </div>

              {/* QUICK STATS - HIỂN THỊ DATA THẬT */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Work Overview</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-2xl font-extrabold text-blue-700">{stats.tasksDone}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Tasks Done</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-2xl font-extrabold text-emerald-700">{stats.projects}</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Projects</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-2xl font-extrabold text-purple-700">{stats.hoursLogged}</p>
                    <p className="text-[10px] font-bold text-purple-500 uppercase mt-1">Hours</p>
                  </div>
                </div>
              </div>

              {/* CONTACT INFO CARD */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-4 shadow-sm">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Email</p>
                      <p className="text-sm font-semibold text-slate-800 truncate w-40">{profile.email}</p>
                    </div>
                  </div>
                  
                  {profile.phone && (
                    <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-4 shadow-sm">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">Phone</p>
                        <p className="text-sm font-semibold text-slate-800">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: BIO, SKILLS & ACTIVITY */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* ABOUT ME & SKILLS */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">About Me</h2>
                {profile.bio ? (
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                ) : (
                  <p className="text-slate-400 text-sm italic bg-slate-50 p-4 rounded-lg">This user hasn't added a bio yet.</p>
                )}

                {/* SKILLS TAGS TỪ DATABASE */}
                <div className="mt-8">
                   <h3 className="font-bold text-slate-800 text-sm mb-3">Expertise & Skills</h3>
                   {userSkills.length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                       {userSkills.map((skill, idx) => (
                         <span key={idx} className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition cursor-default shadow-sm">
                           {skill}
                         </span>
                       ))}
                     </div>
                   ) : (
                     <p className="text-slate-400 text-sm italic text-xs">No skills added yet.</p>
                   )}
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Recent Activity</h2>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {activities.length > 0 ? (
                    activities.slice(0, 8).map((act, index) => (
                      <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 text-sm">{profile.fullName}</span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {new Date(act.timestamp).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {act.action} <span className="font-semibold text-blue-600">{act.taskTitle}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-sm italic text-center py-10">No recent activity found.</div>
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