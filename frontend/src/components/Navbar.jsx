
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { PiStudentDuotone } from "react-icons/pi";
export default function Navbar() {
  const { user, logout } = useAuth();
  console.log(user);
const linkClass = ({ isActive }) => `text-white ${isActive ? "underline" : ""}`;
  const nav = (
    <>
      <li><NavLink className={linkClass} to="/">Home</NavLink></li>
      <li><NavLink className={linkClass} to="/dashboard">Dashboard</NavLink></li>
      <li><NavLink className={linkClass} to="/about-us">About Us</NavLink></li>
      <li><NavLink className={linkClass} to="/terms-and-conditions">Terms & Conditions</NavLink></li>
    </>
  );

  return (
    <div className="navbar bg-[#03A9F4] backdrop-blur sticky top-0 z-50 text-white font-semibold">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-[#03A9F4] rounded-box w-52">
            {nav}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold items-center"><PiStudentDuotone className="font-bold" /> Student Toolkit</Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{nav}</ul>
      </div>
      <div className="navbar-end gap-2">
        {user?.email ? (
          <>
            <Link title={user?.displayName} to={'/profile'} className="avatar">
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img 
                referrerPolicy="no-referrer" 
                alt={user?.displayName}
                src={user?.photoURL || "https://i.ibb.co/2y0rPjH/user.png"} />
              </div>
            </Link>
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