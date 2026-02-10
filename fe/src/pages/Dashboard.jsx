import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <p>Welcome, {user?.fullName}</p>
      <p>Role: {user?.role}</p>

      <button
        onClick={logout}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
