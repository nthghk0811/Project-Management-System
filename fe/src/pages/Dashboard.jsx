import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

export default function Dashboard() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar />

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-3">Projects</h2>
              <div className="h-40 flex items-center justify-center text-gray-400">
                Project preview here
              </div>
            </div>

            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-3">Tasks</h2>
              <div className="h-40 flex items-center justify-center text-gray-400">
                Chart here
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-3">Work Log</h2>
              <div className="h-40 flex items-center justify-center text-gray-400">
                Chart here
              </div>
            </div>

            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-3">Performance</h2>
              <div className="h-40 flex items-center justify-center text-gray-400">
                Chart here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
