import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getWorkspace } from "../../api/workspaces";

export default function WorkspaceGuard({ children }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getWorkspace()
      .then((w) => {
        if (!cancelled) setWorkspace(w);
      })
      .catch(() => {
        if (!cancelled) setWorkspace(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (user?.role === "owner" && workspace && !workspace.isActive) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
