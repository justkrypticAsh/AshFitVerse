// src/components/MobileBottomDock.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useTheme from "../hooks/usetheme";
import useIsMobile from "../hooks/useIsMobile";
import useCommunityUnread from "../hooks/useCommunityUnread";
import { FONT } from "../theme";

export default function MobileBottomDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(840);
  const { dark, T } = useTheme();
  const { hasCommunityUpdate } = useCommunityUnread();

  // Hide dock on public and onboarding routes
  const publicRoutes = ["/", "/login", "/signup", "/onboarding"];
  if (!isMobile || publicRoutes.includes(location.pathname)) {
    return null;
  }

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: "⚡",
      path: "/dashboard",
      isActive: (pathname) => pathname === "/dashboard",
    },
    {
      id: "train",
      label: "Train",
      icon: "🏋️",
      path: "/workout-planner",
      isActive: (pathname) => pathname.startsWith("/workout"),
    },
    {
      id: "fuel",
      label: "Fuel",
      icon: "🥗",
      path: "/diet-logger",
      isActive: (pathname) => pathname.startsWith("/diet"),
    },
    {
      id: "squad",
      label: "Squad",
      icon: "👥",
      path: "/community",
      isActive: (pathname) => pathname.startsWith("/community"),
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      path: "/profile",
      isActive: (pathname) => pathname.startsWith("/profile") || pathname.startsWith("/user/"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      style={{
        position: "fixed",
        bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        left: 14,
        right: 14,
        height: 60,
        borderRadius: 24,
        zIndex: 990,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 6px",
        boxSizing: "border-box",
        background: dark ? "rgba(11, 14, 23, 0.94)" : "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.07)"}`,
        boxShadow: dark
          ? "0 12px 36px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3)"
          : "0 10px 30px rgba(15, 23, 42, 0.12), 0 1px 4px rgba(0, 0, 0, 0.04)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.isActive(location.pathname);
        const activeColor = T?.accent || "#3b82f6";
        const inactiveColor = dark ? "rgba(241, 245, 249, 0.45)" : "rgba(15, 23, 42, 0.45)";

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (location.pathname !== tab.path) {
                navigate(tab.path);
              }
            }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              background: active
                ? dark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.04)"
                : "none",
              border: "none",
              borderRadius: 16,
              cursor: "pointer",
              padding: "5px 2px",
              margin: "0 2px",
              height: 48,
              boxSizing: "border-box",
              transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)",
              WebkitTapHighlightColor: "transparent",
              outline: "none",
            }}
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              <span
                style={{
                  fontSize: 18,
                  lineHeight: 1,
                  transform: active ? "translateY(-1px) scale(1.08)" : "none",
                  transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                  display: "block",
                }}
              >
                {tab.icon}
              </span>
              {tab.id === "squad" && hasCommunityUpdate && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -5,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#3b82f6",
                    boxShadow: "0 0 6px rgba(59, 130, 246, 0.9)",
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 800 : 600,
                fontFamily: FONT?.display || "'Plus Jakarta Sans', sans-serif",
                color: active ? activeColor : inactiveColor,
                letterSpacing: "0.01em",
                lineHeight: 1.1,
                transition: "color 0.2s ease",
              }}
            >
              {tab.label}
            </span>
            {active && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: activeColor,
                  marginTop: 1,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
