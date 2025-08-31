
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthProvider";

export default function Register(){
  const { registerEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e)=>{
    e.preventDefault();
    try{
      await registerEmail(email, pass, name);
      Swal.fire("Account created", "Welcome aboard!", "success");
      navigate("/dashboard");
    }catch(err){
      Swal.fire("Oops", err.message, "error");
    }
  }

  return (
    <div className="max-w-md mx-auto card bg-base-100 shadow p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-[#03A9F4]">Register</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input input-bordered w-full" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} required/>
        <input className="input input-bordered w-full" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
        <input className="input input-bordered w-full" type="password" placeholder="Password" value={pass} onChange={(e)=>setPass(e.target.value)} required/>
        <button className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC] w-full" type="submit">Create account</button>
      </form>
      <p className="mt-3 text-sm text-center">Already have an account? <Link className="link  text-[#03A9F4]" to="/login">Login</Link></p>
    </div>
  );
}

