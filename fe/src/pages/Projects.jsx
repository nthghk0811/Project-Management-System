import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import ProjectCard from "../components/projects/ProjectCard";
import { getMyProjectsApi } from "../api/projectApi";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const fetchProjects = async () => {
    const res = await getMyProjectsApi();
    setProjects(res.data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6">
          {/* top */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Projects</h1>
            <button
              onClick={() => setOpenModal(true)}
              className="bg-black text-white px-4 py-2 rounded"
            >
              + New Project
            </button>
          </div>

          {/* grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        </div>
      </div>

      <CreateProjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={fetchProjects}
      />
    </div>
  );
}
