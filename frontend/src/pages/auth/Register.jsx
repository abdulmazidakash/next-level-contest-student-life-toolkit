import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthProvider";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { Helmet } from "react-helmet";
import { PiStudentDuotone } from "react-icons/pi";
import Loader from "../../components/Loader";

export default function Register() {
  const { registerEmail, loginGoogle, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();
    const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerEmail(email, pass, name);
      Swal.fire("Account created", "Welcome aboard!", "success");
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire("Oops", err.message, "error");
    }
  };

  const onGoogle = async () => {
    try {
      await loginGoogle();
      Swal.fire("Welcome", "Registered with Google", "success");
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire("Oops", err.message, "error");
    }
  };
  if(loading) return <Loader/>;

  return (
    <>
    <Helmet>
      <title>Register | Student Toolkit</title>
    </Helmet>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-md mx-auto card my-8 shadow-lg p-6 border border-gray-100 rounded-2xl"
    >
      {/* Logo & Title */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-[#03A9F4]">Register</h2>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input input-bordered w-full"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          Create account
        </button>
      </form>

      {/* Google Login */}
      <button
        className="btn border border-[#03A9F4] text-gray-700 w-full mt-3 flex items-center justify-center gap-2"
        onClick={onGoogle}
      >
        <FcGoogle className="text-xl" /> Continue with Google
      </button>

      {/* Already account? */}
      <p className="mt-3 text-sm text-center">
        Already have an account?{" "}
        <Link className="link text-[#03A9F4]" to="/login">
          Login
        </Link>
      </p>
      <p className="mt-3 font-bold text-center">
        <Link to="/" className="btn btn-ghost text-xl font-bold items-center text-[#03A9F4]"><PiStudentDuotone className="font-bold" /> Student Toolkit</Link>
      </p>
    </motion.div>
    </>
  );
}
