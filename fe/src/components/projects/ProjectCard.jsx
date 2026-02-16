export default function ProjectCard({ project }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow transition">
      {/* header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{project.name}</h3>
        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
          {project.status}
        </span>
      </div>

      <p className="text-sm text-gray-500 line-clamp-3 mb-4">
        {project.description || "No description"}
      </p>

      {/* footer */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-red-500">
          Deadline:{" "}
          {project.endDate
            ? new Date(project.endDate).toLocaleDateString()
            : "N/A"}
        </span>

        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((m) => (
            <div
              key={m._id}
              className="w-7 h-7 rounded-full bg-gray-300 text-xs flex items-center justify-center border"
            >
              {m.fullName[0]}
            </div>
          ))}
          {project.members.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-200 text-xs flex items-center justify-center border">
              +{project.members.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
