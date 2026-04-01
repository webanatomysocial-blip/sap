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
  const [isContributor, setIsContributor] = useState(false);

  // Rehydrate from localStorage on mount and fetch fresh data from server
  useEffect(() => {
    const auth = localStorage.getItem("memberAuth");
    if (auth === "true") {
      const savedMember = JSON.parse(
        localStorage.getItem("memberData") || "null",
      );
      if (savedMember) {
        setIsLoggedIn(true);
        setMember(savedMember);
        setIsContributor(localStorage.getItem("isContributor") === "true");

        // Fetch fresh data from server to ensure sync
        import("../services/api").then(({ getMemberProfile }) => {
          getMemberProfile()
            .then((res) => {
              if (res.data.status === "success") {
                const freshMember = res.data.member;
                setMember(freshMember);
                localStorage.setItem("memberData", JSON.stringify(freshMember));
              }
            })
            .catch((err) => {
              console.error("Failed to sync member profile on mount:", err);
              if (err.response?.status === 401) {
                logout(); // Session expired on server
              }
            });
        });
      }
    }
  }, []);

  const login = (memberData, token, isContributor = false) => {
    setIsLoggedIn(true);
    setMember(memberData);
    setIsContributor(isContributor);
    localStorage.setItem("memberAuth", "true");
    localStorage.setItem("memberData", JSON.stringify(memberData));
    localStorage.setItem("memberToken", token);
    localStorage.setItem("isContributor", isContributor ? "true" : "false");
  };

  const updateMember = (updatedMemberData) => {
    setMember(updatedMemberData);
    localStorage.setItem("memberData", JSON.stringify(updatedMemberData));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setMember(null);
    setIsContributor(false);
    localStorage.removeItem("memberAuth");
    localStorage.removeItem("memberData");
    localStorage.removeItem("memberToken");
    localStorage.removeItem("isContributor");
  };

  return (
    <MemberAuthContext.Provider
      value={{ isLoggedIn, member, isContributor, login, logout, updateMember }}
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
