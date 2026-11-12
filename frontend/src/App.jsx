import { useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, HeartPulse, LogOut, PawPrint, Pill, Stethoscope, Users, UserRound } from "lucide-react";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ResourcePage from "./pages/ResourcePage.jsx";
import ReservationPage from "./pages/ReservationPage.jsx";

const storedSession = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("vet-session") || "null");
    const token = localStorage.getItem("vet-token");
    return saved && token ? saved : null;
  } catch {
    return null;
  }
};

function Guard({ session, children }) {
  const location = useLocation();
  return session ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function AppLayout({ session, onLogout, toast, children }) {
  const location = useLocation();
  const links = useMemo(() => [
    { to: "/dashboard", label: "Pregled", icon: HeartPulse },
    ...(session.role === "admin" ? [{ to: "/owners", label: "Vlasnici", icon: Users }] : [{ to: "/profile", label: "Moj profil", icon: UserRound }]),
    { to: "/pets", label: "Ljubimci", icon: PawPrint },
    { to: "/vets", label: "Veterinari", icon: Stethoscope },
    ...(session.role === "admin" ? [{ to: "/medicines", label: "Lekovi", icon: Pill }] : []),
    { to: "/reservations", label: "Termini", icon: CalendarDays },
  ], [session.role]);

  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand paws-brand" to="/"><span className="brand-mark"><PawPrint size={21} /></span><span>PAWS</span></Link>
      <div className="clinic-label">PAWS · AMBULANTA</div>
      <nav className="side-nav">
        {links.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={`nav-link ${location.pathname === to ? "active" : ""}`}>
          <Icon size={18} /><span>{label}</span>
        </Link>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="profile-chip"><div className="avatar">{(session.user?.ime || session.user?.username || "U").slice(0, 1).toUpperCase()}</div><div className="profile-copy"><strong>{session.user?.ime ? `${session.user.ime} ${session.user.prezime || ""}` : session.user?.username}</strong><span>{session.role === "admin" ? "Administrator" : "Vlasnik ljubimca"}</span></div></div>
        <button className="logout-button" onClick={onLogout}><LogOut size={17} /> Odjavi se</button>
      </div>
    </aside>
    <main className="main-panel">
      <header className="topbar"><div className="mobile-brand"><PawPrint size={20} /> PAWS</div><div className="topbar-meta"><span className="status-dot" /> PAWS ambulanta <span className="topbar-divider">/</span> {session.role === "admin" ? "Administrator" : "Vlasnik"}</div><div className="topbar-user">{session.user?.username}</div></header>
      <div className="page-wrap">{children}</div>
    </main>
    {toast && <div className={`toast ${toast.type}`} role="status">{toast.message}</div>}
  </div>;
}

export default function App() {
  const [session, setSession] = useState(storedSession);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3600);
  };
  const signIn = (result) => {
    const user = result.owner || result.admin;
    const value = { role: result.role, user };
    localStorage.setItem("vet-token", result.token);
    localStorage.setItem("vet-session", JSON.stringify(value));
    setSession(value);
    notify(`Welcome${user?.ime ? `, ${user.ime}` : ""}!`);
    navigate("/dashboard");
  };
  const signOut = () => {
    localStorage.removeItem("vet-token");
    localStorage.removeItem("vet-session");
    setSession(null);
    navigate("/");
  };

  const role = session?.role;
  const managedResource = (type) => <ResourcePage kind={type} role={role} toast={notify} />;

  return <Routes>
    <Route path="/" element={<HomePage session={session} />} />
    <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <AuthPage onSignIn={signIn} toast={notify} />} />
    <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <AuthPage register onSignIn={signIn} toast={notify} />} />
    <Route path="*" element={<Guard session={session}><AppLayout session={session} onLogout={signOut} toast={toast}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard session={session} />} />
        <Route path="/owners" element={role === "admin" ? managedResource("owners") : <Navigate to="/dashboard" replace />} />
        <Route path="/profile" element={role === "owner" ? <ProfilePage toast={notify} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/pets" element={managedResource("pets")} />
        <Route path="/vets" element={managedResource("vets")} />
        <Route path="/medicines" element={role === "admin" ? managedResource("medicines") : <Navigate to="/dashboard" replace />} />
        <Route path="/reservations" element={<ReservationPage role={role} toast={notify} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout></Guard>} />
  </Routes>;
}
