// ─── Navbar Component ───

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Heart, LogOut, Menu, X, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "NGO") return "/ngo";
    return "/dashboard";
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-all">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">TrustFund</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/campaigns" className="text-dark-600 hover:text-primary-600 font-medium transition-colors">
              Campaigns
            </Link>

            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-dark-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-dark-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-dark-800">{user.name}</p>
                      <p className="text-dark-400 text-xs capitalize">{user.role.toLowerCase()}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-dark-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-dark-600 hover:text-primary-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-dark-600 hover:bg-dark-100 rounded-lg">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-2">
            <Link to="/campaigns" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-dark-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg">
              Campaigns
            </Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-dark-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg">
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-dark-600 hover:bg-primary-50 rounded-lg">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-white bg-primary-500 rounded-lg text-center">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
