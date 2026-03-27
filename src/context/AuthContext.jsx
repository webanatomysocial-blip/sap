import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

/**
 * AuthContext — provides { user, role, permissions, isAuthenticated, setAuth, clearAuth }
 * to all admin components without prop drilling.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest");
  const [permissions, setPermissions] = useState({});

  // Rehydrate from localStorage on mount AND verify with backend
  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth === "true") {
      const verifySession = async () => {
        try {
          const { data } = await axios.get("/api/verify_session.php");
          if (data.status === "success") {
            setUser(data.user);
            setRole(data.role || data.user.role || "admin");
            setPermissions(data.permissions || {});
            setIsAuthenticated(true);
          } else {
            clearAuth();
          }
        } catch (err) {
          console.error("Session verification failed", err);
          clearAuth();
        }
      };
      verifySession();
    }
  }, []);

  const setAuth = ({ user, role, permissions, csrf_token }) => {
    setIsAuthenticated(true);
    setUser(user);
    setRole(role || "admin");
    setPermissions(permissions || {});

    localStorage.setItem("adminAuth", "true");
    localStorage.setItem("adminUser", JSON.stringify(user));
    localStorage.setItem("userRole", role || "admin");
    localStorage.setItem("userPermissions", JSON.stringify(permissions || {}));
    if (csrf_token) {
      localStorage.setItem("csrf_token", csrf_token);
    }
  };

  const clearAuth = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRole("guest");
    setPermissions({});
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userPermissions");
    localStorage.removeItem("csrf_token");
  };

  /** Quick permission helper for components */
  const can = (key) => role === "admin" || !!permissions[key];

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        permissions,
        can,
        setAuth,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export default AuthContext;
