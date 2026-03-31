// fe/src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col overflow-x-hidden">
      
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#0b57d0] rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
          </div>
          <span className="text-xl font-bold text-[#1B2559] tracking-tight">SyncBoard</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-[#0b57d0] transition px-4 py-2">Log in</Link>
          <Link to="/register" className="bg-[#1B2559] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-sm active:scale-95">Get Started</Link>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 lg:px-12 relative z-10">
        
        {/* Background glow effects - Giữ ở mức tối giản, không lạm dụng */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-400/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Real-time Sync v2.0 is live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#1B2559] tracking-tight leading-[1.1] mb-6">
            Ship software faster. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0b57d0] to-blue-400">Zero corporate BS.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            The pragmatic project management tool for teams that actually want to get work done. 
            Real-time Kanban, built-in cloud storage, and instant command center broadcasts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-[#0b57d0] text-white text-base font-bold px-8 py-4 rounded-xl hover:bg-blue-700 hover:shadow-[0_8px_25px_rgba(11,87,208,0.25)] transition-all active:scale-95 flex items-center justify-center">
              Start building for free
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
            <a href="#features" className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 text-base font-bold px-8 py-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center">
              Explore features
            </a>
          </div>
        </div>

        {/* ================= ABSTRACT UI MOCKUP (No generic images) ================= */}
        <div className="w-full max-w-5xl mx-auto relative perspective-[1000px] mt-4">
          <div className="absolute inset-0 bg-gradient-to-t from-[#f4f7fe] via-transparent to-transparent z-10 bottom-[-20px] h-32 mt-auto"></div>
          
          <div className="bg-white rounded-t-2xl sm:rounded-3xl border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-4 sm:p-6 rotate-x-12 transform-gpu">
            {/* Mock Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                <div>
                  <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="w-20 h-3 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white relative z-10"></div>
                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white -ml-4 relative z-20"></div>
                <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white -ml-4 relative z-30"></div>
              </div>
            </div>

            {/* Mock Kanban Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-[400px] overflow-hidden">
              {/* Column 1 */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-3">
                <div className="flex justify-between items-center px-1 mb-2">
                  <div className="w-16 h-3 bg-slate-300 rounded"></div>
                  <div className="w-6 h-4 bg-slate-200 rounded-full"></div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm h-24">
                  <div className="w-8 h-2 bg-rose-200 rounded mb-3"></div>
                  <div className="w-3/4 h-3 bg-slate-700 rounded mb-2"></div>
                  <div className="w-1/2 h-3 bg-slate-700 rounded"></div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm h-28">
                  <div className="w-8 h-2 bg-emerald-200 rounded mb-3"></div>
                  <div className="w-full h-3 bg-slate-700 rounded mb-2"></div>
                  <div className="w-2/3 h-3 bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-3 hidden sm:block">
                <div className="flex justify-between items-center px-1 mb-2">
                  <div className="w-20 h-3 bg-blue-300 rounded"></div>
                  <div className="w-6 h-4 bg-slate-200 rounded-full"></div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-300 shadow-md h-32 relative -translate-y-2">
                  <div className="w-8 h-2 bg-amber-200 rounded mb-3"></div>
                  <div className="w-full h-3 bg-slate-800 rounded mb-2"></div>
                  <div className="w-4/5 h-3 bg-slate-800 rounded mb-4"></div>
                  <div className="flex justify-end"><div className="w-6 h-6 rounded-full bg-blue-100"></div></div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-3 hidden md:block">
                <div className="flex justify-between items-center px-1 mb-2">
                  <div className="w-12 h-3 bg-emerald-300 rounded"></div>
                  <div className="w-6 h-4 bg-slate-200 rounded-full"></div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm h-20 opacity-60">
                   <div className="w-full h-2 bg-slate-300 rounded mb-2"></div>
                   <div className="w-1/2 h-2 bg-slate-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-24 bg-white border-t border-slate-200 relative z-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2559] tracking-tight mb-4">Built for ruthless execution.</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">No bloated features you'll never use. Just the core tools required to align your team, track workloads, and ship on time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Real-time WebSocket</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">Say goodbye to the refresh button. Tasks move, comments appear, and statuses update instantly across all screens via Socket.io.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-lg hover:border-amber-200 transition-all group">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Global Command Center</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">Admins can broadcast critical announcements to the entire company or send direct alerts to individuals with a single click.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-lg hover:border-emerald-200 transition-all group">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Workload Analytics</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">Keep your team from burning out. Track task distribution, time logs, and performance metrics across a 6-month historical view.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="bg-[#1B2559] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Stop managing work in spreadsheets.</h2>
          <p className="text-slate-300 font-medium mb-10 text-lg">Join the workspace designed for clarity, speed, and accountability.</p>
          <Link to="/register" className="inline-block bg-white text-[#1B2559] text-base font-bold px-10 py-4 rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-xl">
            Create your workspace
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center">
        <p className="text-sm font-bold text-slate-400">© 2026 SyncBoard. Built with ruthless pragmatism.</p>
      </footer>

    </div>
  );
}