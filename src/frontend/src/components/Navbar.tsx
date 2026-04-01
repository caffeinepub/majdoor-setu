import { Button } from "@/components/ui/button";
import { Bell, HardHat, Menu, Shield, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import {
  type Notification,
  getNotifications,
  getUnreadCount,
  markAllRead,
} from "../utils/notifications";

interface NavbarProps {
  page: Page;
  navigate: (p: Page) => void;
}

export default function Navbar({ page, navigate }: NavbarProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: isAdmin } = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(getUnreadCount);
  const [notifications, setNotifications] =
    useState<Notification[]>(getNotifications);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
      setUnreadCount(getUnreadCount());
      setNotifications(getNotifications());
    };
    window.addEventListener("majdoor_notification", handler);
    return () => window.removeEventListener("majdoor_notification", handler);
  }, []);

  // Close bell dropdown on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  const openBell = () => {
    setBellOpen((v) => !v);
    markAllRead();
    setUnreadCount(0);
    setNotifications(getNotifications());
  };

  const navLinks: { label: string; page: Page }[] = [
    { label: "होम", page: "home" },
    { label: "मजदूर खोजें", page: "workers" },
    { label: "नौकरी खोजें", page: "jobs" },
  ];

  const handleNav = (p: Page) => {
    navigate(p);
    setMenuOpen(false);
  };

  const formatTime = (time: number) => {
    const diff = Date.now() - time;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "अभी";
    if (mins < 60) return `${mins} मिनट पहले`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} घंटे पहले`;
    return `${Math.floor(hrs / 24)} दिन पहले`;
  };

  return (
    <header
      className="sticky top-0 z-50 bg-navy shadow-md"
      data-ocid="navbar.panel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
            data-ocid="navbar.link"
          >
            <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">मजदूर सेतु</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.page}
                onClick={() => handleNav(link.page)}
                data-ocid="navbar.link"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  page === link.page
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNav("admin")}
                data-ocid="navbar.link"
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  page === "admin"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                एडमिन
              </button>
            )}
          </nav>

          {/* Auth + Bell */}
          <div className="hidden md:flex items-center gap-3">
            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={openBell}
                className="relative text-white/80 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors"
                data-ocid="navbar.toggle"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div
                  className="absolute right-0 top-11 w-80 bg-card border border-border rounded-xl shadow-lg z-50"
                  data-ocid="navbar.popover"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground text-sm">
                      सूचनाएं
                    </h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div
                        className="px-4 py-6 text-center text-sm text-muted-foreground"
                        data-ocid="navbar.empty_state"
                      >
                        कोई नई सूचना नहीं
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className="px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-sm text-foreground">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatTime(n.time)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <span className="text-xs text-orange font-semibold bg-white/10 px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={clear}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  data-ocid="navbar.button"
                >
                  लॉग आउट
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="bg-orange hover:bg-orange/90 text-white font-semibold px-5"
                data-ocid="navbar.button"
              >
                {loginStatus === "logging-in" ? "लॉगिन..." : "लॉगिन"}
              </Button>
            )}
          </div>

          {/* Mobile right side: bell + menu */}
          <div className="md:hidden flex items-center gap-1">
            {/* Mobile Bell */}
            <div className="relative" ref={undefined}>
              <button
                type="button"
                onClick={openBell}
                className="relative text-white/80 hover:text-white p-2 rounded-md"
                data-ocid="navbar.toggle"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              className="text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              data-ocid="navbar.toggle"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bell Dropdown */}
      {bellOpen && (
        <div className="md:hidden bg-card border-t border-border mx-4 mb-2 rounded-xl shadow-lg">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">सूचनाएं</h3>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                कोई नई सूचना नहीं
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-border/50 last:border-0"
                >
                  <p className="text-sm text-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTime(n.time)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 pb-4">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.page}
              onClick={() => handleNav(link.page)}
              data-ocid="navbar.link"
              className="block w-full text-left px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-md text-sm"
            >
              {link.label}
            </button>
          ))}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNav("admin")}
              data-ocid="navbar.link"
              className="flex items-center gap-1 w-full text-left px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-md text-sm"
            >
              <Shield className="w-3.5 h-3.5" /> एडमिन
            </button>
          )}
          <div className="mt-3 pt-3 border-t border-white/10">
            {isLoggedIn ? (
              <Button
                size="sm"
                onClick={clear}
                className="w-full bg-white/10 text-white border border-white/20"
                data-ocid="navbar.button"
              >
                लॉग आउट
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                className="w-full bg-orange text-white font-semibold"
                data-ocid="navbar.button"
              >
                लॉगिन
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
