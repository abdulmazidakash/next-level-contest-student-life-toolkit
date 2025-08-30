
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";

export default function ClassSchedule(){
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ subject: "", day: "", time: "", instructor: "", color: "#317371" });

  const load = async ()=>{
    const { data } = await api.get(`/classes/${user.email}`);
    setItems(data || []);
  }
  useEffect(()=>{ if(user?.email) load(); },[user?.email])

  const handleSubmit = async (e)=>{
    e.preventDefault();
    // simple validations
    const timeRegex = /^(?:[01]?\d|2[0-3]):[0-5]\d$/; // 24h HH:mm
    if(!timeRegex.test(form.time)){
      return Swal.fire("Invalid", "Please enter time as HH:mm (24h)", "warning");
    }
    try{
      const payload = { ...form, email: user.email };
      await api.post("/classes", payload);
      Swal.fire("Added", "Class saved", "success");
      setForm({ subject: "", day: "", time: "", instructor: "", color: "#317371" });
      load();
    }catch(err){ Swal.fire("Error", err.message, "error"); }
  }

  const remove = async (id)=>{
    await api.delete(`/classes/${id}`);
    Swal.fire("Deleted", "Class removed", "success");
    load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow p-6 space-y-3">
        <h2 className="text-xl font-semibold">Add Class</h2>
        <input className="input input-bordered w-full" placeholder="Subject" value={form.subject} onChange={e=>setForm(f=>({...f, subject:e.target.value}))} required/>
        <select className="select select-bordered w-full" value={form.day} onChange={e=>setForm(f=>({...f, day:e.target.value}))} required>
          <option value="" disabled>Select day</option>
          {"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(',').map(d=> <option key={d} value={d}>{d}</option>)}
        </select>
        <input className="input input-bordered w-full" placeholder="Time (HH:mm)" value={form.time} onChange={e=>setForm(f=>({...f, time:e.target.value}))} required/>
        <input className="input input-bordered w-full" placeholder="Instructor" value={form.instructor} onChange={e=>setForm(f=>({...f, instructor:e.target.value}))} required/>
        <input className="input input-bordered w-full" type="color" value={form.color} onChange={e=>setForm(f=>({...f, color:e.target.value}))}/>
        <button className="btn btn-primary">Save</button>
      </form>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">My Classes</h2>
        {items.length === 0 && <div className="alert">No classes yet</div>}
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((c)=> (
            <div key={c._id} className="p-4 rounded-xl shadow" style={{background:c.color+"20"}}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{c.subject}</div>
                  <div className="text-sm opacity-80">{c.day} • {c.time}</div>
                  <div className="text-sm">{c.instructor}</div>
                </div>
                <button className="btn btn-sm btn-error" onClick={()=>remove(c._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

