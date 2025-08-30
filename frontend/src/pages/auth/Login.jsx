
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthProvider";

export default function Login(){
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
  }

  const onGoogle = async () => {
    try {
      await loginGoogle();
      Swal.fire("Welcome", "Logged in with Google", "success");
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire("Oops", err.message, "error");
    }
  }

  return (
    <div className="max-w-md mx-auto card bg-base-100 shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input input-bordered w-full" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
        <input className="input input-bordered w-full" type="password" placeholder="Password" value={pass} onChange={(e)=>setPass(e.target.value)} required/>
        <button className="btn btn-primary w-full" type="submit">Login</button>
      </form>
      <button className="btn btn-outline w-full mt-3" onClick={onGoogle}>Continue with Google</button>
      <p className="mt-3 text-sm">New here? <Link className="link" to="/register">Register</Link></p>
    </div>
  );
}
