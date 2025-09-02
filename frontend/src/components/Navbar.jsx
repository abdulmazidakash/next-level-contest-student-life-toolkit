
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
const linkClass = ({ isActive }) => (isActive ? "underline" : "text-white");
  const nav = (
    <>
      <li><NavLink className={linkClass} to="/">Home</NavLink></li>
      <li><NavLink className={linkClass} to="/dashboard">Dashboard</NavLink></li>
      <li><NavLink className={linkClass} to="/classes">Classes</NavLink></li>
      <li><NavLink className={linkClass} to="/budget">Budget</NavLink></li>
      <li><NavLink className={linkClass} to="/planner">Planner</NavLink></li>
      <li><NavLink className={linkClass} to="/exam">Exam Q&A</NavLink></li>
      <li><NavLink className={linkClass} to="/focus">Focus Mode</NavLink></li>
      <li><NavLink className={linkClass} to="/weekly-progress">Weekly Progress</NavLink></li>
    </>
  );

  return (
    <div className="navbar bg-[#03A9F4] backdrop-blur sticky top-0 z-50 text-white font-semibold">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">☰</div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-[#03A9F4] rounded-box w-52">
            {nav}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl">🎒 Student Toolkit</Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{nav}</ul>
      </div>
      <div className="navbar-end gap-2">
        {user?.email ? (
          <>
            <div className="avatar">
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={user.photoURL || "https://i.ibb.co/2y0rPjH/user.png"} />
              </div>
            </div>
            <button className="btn btn-sm font-semibold text-[#03A9F4] border-[#03A9F4]" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm text-[#03A9F4] border-[#03A9F4]">Login</Link>
            <Link to="/register" className="btn btn-sm text-[#03A9F4] border-[#03A9F4]">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

