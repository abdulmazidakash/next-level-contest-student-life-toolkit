import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthProvider";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { Helmet } from "react-helmet";
import { PiStudentDuotone } from "react-icons/pi";

export default function Login() {
  const { loginEmail, loginGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginEmail(email, pass);
      Swal.fire("Welcome", "Logged in successfully", "success");
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire("Oops", err.message, "error");
    }
  };

  const onGoogle = async () => {
    try {
      await loginGoogle();
      Swal.fire("Welcome", "Logged in with Google", "success");
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire("Oops", err.message, "error");
    }
  };

  return (
    <>
    <Helmet>
      <title>Login | Student Toolkit</title>
    </Helmet>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-md mx-auto card  shadow-xl p-6 my-8 rounded-lg  border border-gray-100 "
    >
      {/* Logo & Title */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-[#03A9F4]">Login</h2>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input input-bordered w-full"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input input-bordered w-full"
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <button
          className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC] w-full"
          type="submit"
        >
          Login
        </button>
      </form>

      {/* Google Login */}
      <button
        className="btn border border-[#03A9F4] text-gray-700 w-full mt-3 flex items-center justify-center gap-2"
        onClick={onGoogle}
      >
        <FcGoogle className="text-xl" /> Continue with Google
      </button>

      {/* Link to Register */}
      <p className="mt-3 text-sm text-center">
        New here?{" "}
        <Link className="link text-[#03A9F4]" to="/register">
          Register
        </Link>
      </p>

      <p className="mt-3 font-bold text-center">
        <Link to="/" className="btn btn-ghost text-xl font-bold items-center text-[#03A9F4]"><PiStudentDuotone className="font-bold" /> Student Toolkit</Link>
      </p>
    </motion.div>
    </>
  );
}
