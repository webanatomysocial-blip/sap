import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * MemberAuthContext — provides member session state to frontend components.
 * Member auth is localStorage-based (matches contributor pattern).
 * Keys: memberAuth="true", memberData=JSON, memberToken=<string>
 */
const MemberAuthContext = createContext(null);

export const MemberAuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [member, setMember] = useState(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const auth = localStorage.getItem("memberAuth");
    if (auth === "true") {
      const savedMember = JSON.parse(
        localStorage.getItem("memberData") || "null",
      );
      if (savedMember) {
        setIsLoggedIn(true);
        setMember(savedMember);
      }
    }
  }, []);

  const login = (memberData, token) => {
    setIsLoggedIn(true);
    setMember(memberData);
    localStorage.setItem("memberAuth", "true");
    localStorage.setItem("memberData", JSON.stringify(memberData));
    localStorage.setItem("memberToken", token);
  };

  const updateMember = (updatedMemberData) => {
    setMember(updatedMemberData);
    localStorage.setItem("memberData", JSON.stringify(updatedMemberData));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setMember(null);
    localStorage.removeItem("memberAuth");
    localStorage.removeItem("memberData");
    localStorage.removeItem("memberToken");
  };

  return (
    <MemberAuthContext.Provider
      value={{ isLoggedIn, member, login, logout, updateMember }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
};

export const useMemberAuth = () => {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error("useMemberAuth must be inside MemberAuthProvider");
  return ctx;
};

export default MemberAuthContext;
