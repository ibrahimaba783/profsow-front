import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";
import logo from "../assets/logo-aliou-sow-academy-navbar.png";

const ANCHOR_LINKS = [
  { id: "modules", label: "Modules" },
  { id: "courses", label: "Cours" },
  { id: "testimonials", label: "Témoignages" },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAnchorClick = (id) => (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="navbar-premium fixed top-0 left-0 w-full z-50">

      <div className="max-w-7xl mx-auto h-[82px] px-8 flex items-center justify-between">

        {/* ================= LOGO ================= */}

        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <div className="relative">

            <img
              src={logo}
              alt="Aliou Sow Academy"
              className="h-12 transition duration-300 group-hover:scale-105"
            />

          </div>

          <div className="hidden sm:block">

            <h2 className="logo-text text-xl">
              ALIOU SOW
            </h2>

            <p className="text-[11px] uppercase tracking-[4px] text-slate-300">
              Academy
            </p>

          </div>

        </Link>

        {/* ================= MENU ================= */}

        <div className="hidden lg:flex items-center gap-10">

          <Link
            to="/"
            className="nav-link"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            }}
          >
            Accueil
          </Link>

          {ANCHOR_LINKS.map((item) => (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              onClick={handleAnchorClick(item.id)}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}

        </div>

        {/* ================= ACTIONS ================= */}

        <div className="flex items-center gap-4">

          {user ? (
            <>

              <Link
                to={
                  user.role === "teacher"
                    ? "/teacher-dashboard"
                    : "/student-dashboard"
                }
                className="dashboard-btn"
              >
                <LayoutDashboard size={18} />

                <span className="hidden md:inline">
                  Mon espace
                </span>
              </Link>

              <Link
                to="/profile"
                className="profile-btn"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <span className="hidden md:block">
                  {user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                <LogOut size={18} />

                <span className="hidden md:inline">
                  Déconnexion
                </span>
              </button>

            </>
          ) : (
            <>

              <Link
                to="/login"
                className="login-link"
              >
                Connexion
              </Link>

              <Link
                to="/register"
                className="btn-register"
              >
                S'inscrire
              </Link>

            </>
          )}

        </div>

      </div>

    </nav>
  );
};

export default Navbar;