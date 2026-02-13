import { NavLink } from "react-router-dom";

const menu = [
  { name: "Home", path: "/dashboard" },
  { name: "Project", path: "/projects" },
  { name: "Tasks", path: "/tasks" },
  { name: "Work Logs", path: "/worklogs" },
  { name: "Performance", path: "/performance" },
  { name: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <div className="w-60 bg-white border-r h-[calc(100vh-64px)] p-4">
      {menu.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `block px-3 py-2 rounded mb-1 ${
              isActive ? "bg-black text-white" : "hover:bg-gray-100"
            }`
          }
        >
          {item.name}
        </NavLink>
      ))}
    </div>
  );
}
