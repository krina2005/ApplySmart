import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const ProtectedRoute = ({ children, role }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const userRole = user.user_metadata?.role;

      if (role && userRole !== role) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, [role]);

  if (loading) return <div style={{padding:"2rem", textAlign:"center"}}>Loading...</div>;

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
