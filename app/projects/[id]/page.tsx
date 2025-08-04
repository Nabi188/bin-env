"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Clipboard } from "lucide-react";
import { toast } from "sonner";

interface EnvFile {
  id: string;
  name: string;
  rawContent: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  envFiles: EnvFile[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFile, setEditingFile] = useState<EnvFile | null>(null);
  const [formData, setFormData] = useState({ name: "", rawContent: "" });

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log("🔍 Frontend received project data:", data);
        console.log("🔍 ENV files:", data.envFiles);
        data.envFiles?.forEach((file: any, index: number) => {
          console.log(`📄 File ${index + 1} (${file.name}):`, file.rawContent);
        });
        setProject(data);
      } else if (response.status === 404) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateEnvFile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFile
        ? `/api/projects/${params.id}/env-files/${editingFile.id}`
        : `/api/projects/${params.id}/env-files`;

      const method = editingFile ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingFile ? "ENV file updated!" : "ENV file created!");
        setFormData({ name: "", rawContent: "" });
        setShowForm(false);
        setEditingFile(null);
        fetchProject();
      }
    } catch (error) {
      console.error("Failed to save env file:", error);
    }
  };

  const handleEditFile = (file: EnvFile) => {
    setEditingFile(file);
    setFormData({ name: file.name, rawContent: file.rawContent });
    setShowForm(true);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this ENV file?")) return;

    try {
      const response = await fetch(
        `/api/projects/${params.id}/env-files/${fileId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        toast.success("ENV file deleted!");
        fetchProject();
      }
    } catch (error) {
      console.error("Failed to delete env file:", error);
      toast.error("Failed to delete ENV file");
    }
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy content:", error);
      toast.error("Failed to copy content");
    }
  };

  const handlePasteContent = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData({ ...formData, rawContent: text });
      toast.success("Content pasted!");
    } catch (error) {
      console.error("Failed to paste content:", error);
      toast.error("Failed to paste content");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", rawContent: "" });
    setShowForm(false);
    setEditingFile(null);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!project) {
    return <div className="p-8">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Projects
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                New ENV File
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/auth/logout", {
                      method: "POST",
                    });
                    if (response.ok) {
                      toast.success("Logged out successfully!");
                      router.push("/login");
                    }
                  } catch (error) {
                    console.error("Failed to logout:", error);
                    toast.error("Failed to logout");
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingFile ? "Edit ENV File" : "Create New ENV File"}
            </h2>
            <form onSubmit={handleCreateOrUpdateEnvFile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., dev, staging, production"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ENV Content
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteContent}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Clipboard size={16} />
                    Paste
                  </button>
                </div>
                <textarea
                  required
                  placeholder="DATABASE_URL=postgresql://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                  rows={10}
                  value={formData.rawContent}
                  onChange={(e) =>
                    setFormData({ ...formData, rawContent: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  {editingFile ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {project.envFiles.map((envFile) => (
            <div key={envFile.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {envFile.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyContent(envFile.rawContent)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                  <button
                    onClick={() => handleEditFile(envFile)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFile(envFile.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">
                  {envFile.rawContent}
                </pre>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Created: {new Date(envFile.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {project.envFiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No ENV files yet. Create your first ENV file!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
