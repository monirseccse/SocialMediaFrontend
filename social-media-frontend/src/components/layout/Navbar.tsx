"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/ui/Avatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    if (dropOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropOpen]);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-[70px] bg-white border-b"
      style={{ borderColor: "var(--bg4)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 h-full flex items-center gap-4">

        {/* Logo */}
        <a href="/feed" className="flex-shrink-0">
          <Image src="/logo.svg" alt="BuddyScript" width={130} height={34} />
        </a>

        {/* Search */}
        <div className="relative flex-1 max-w-xs hidden md:block">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="17" height="17" fill="none" viewBox="0 0 17 17"
          >
            <circle cx="7" cy="7" r="6" stroke="#666" />
            <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
          </svg>
          <input
            type="search"
            placeholder="Search…"
            className="w-full h-10 pl-10 pr-4 rounded-full text-sm border"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--bg3)",
              color: "var(--color)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--bg3)")}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Nav icons */}
        <ul className="flex items-center gap-1">
          {/* Home – active */}
          <li>
            <a href="/feed" className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors">
              <svg width="18" height="21" fill="none" viewBox="0 0 18 21">
                <path stroke="#1890FF" strokeWidth="1.5" strokeOpacity="1" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
              </svg>
            </a>
          </li>

          {/* Notifications */}
          <li className="relative">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors">
              <svg width="20" height="22" fill="none" viewBox="0 0 20 22">
                <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        </ul>

        {/* Profile dropdown */}
        {user && (
          <div className="relative flex-shrink-0" ref={dropRef}>
            <button
              onClick={() => setDropOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar name={user.name} size="sm" />
              <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate" style={{ color: "var(--color1)" }}>
                {user.name}
              </span>
              <svg
                className={`w-[10px] h-[6px] transition-transform flex-shrink-0 ${dropOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 10 6"
              >
                <path fill="var(--color1)" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
              </svg>
            </button>

            {dropOpen && (
              <div
                className="absolute right-0 mt-1 w-52 bg-white rounded-[6px] py-2 z-50"
                style={{ boxShadow: "var(--shadow1)", border: "1px solid var(--bg4)" }}
              >
                <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: "var(--bg4)" }}>
                  <Avatar name={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color1)" }}>{user.name}</p>
                  </div>
                </div>
                <ul className="py-1">
                  <li>
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: "var(--color1)" }}
                    >
                      <div className="flex items-center gap-2">
                        <svg width="19" height="19" fill="none" viewBox="0 0 19 19">
                          <path stroke="#377DFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.667 18H2.889A1.889 1.889 0 011 16.111V2.89A1.889 1.889 0 012.889 1h3.778M13.277 14.222L18 9.5l-4.723-4.722M18 9.5H6.667" />
                        </svg>
                        Log Out
                      </div>
                      <svg width="6" height="10" fill="none" viewBox="0 0 6 10">
                        <path fill="var(--color1)" d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z" opacity=".5" />
                      </svg>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
