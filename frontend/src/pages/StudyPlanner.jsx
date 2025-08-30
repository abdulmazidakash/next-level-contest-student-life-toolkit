
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";

export default function StudyPlanner(){
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ subject:"", topic:"", priority:"medium", deadline:"", slot:"" });

  const load = async ()=>{
    const { data } = await api.get(`/planners/${user.email}`);
    setTasks(data || []);
  }
  useEffect(()=>{ if(user?.email) load(); },[user?.email]);

  const add = async (e)=>{
    e.preventDefault();
    if(!form.deadline) return Swal.fire("Missing", "Please choose a deadline", "warning");
    const payload = { ...form, email: user.email, done: false, createdAt: Date.now() };
    await api.post('/planners', payload);
    Swal.fire("Added", "Task added to plan", "success");
    setForm({ subject:"", topic:"", priority:"medium", deadline:"", slot:"" });
    load();
  }

  const toggleDone = async (t)=>{
    // optimistic UI (local only). In production, create PATCH endpoint.
    setTasks(prev=> prev.map(p=> p._id===t._id ? { ...p, done: !p.done } : p));
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={add} className="card bg-base-100 shadow p-6 space-y-3">
        <h2 className="text-xl font-semibold">New Study Task</h2>
        <input className="input input-bordered w-full" placeholder="Subject" value={form.subject} onChange={e=>setForm(f=>({...f, subject:e.target.value}))} required/>
        <input className="input input-bordered w-full" placeholder="Topic" value={form.topic} onChange={e=>setForm(f=>({...f, topic:e.target.value}))} required/>
        <div className="grid grid-cols-2 gap-3">
          <select className="select select-bordered" value={form.priority} onChange={e=>setForm(f=>({...f, priority:e.target.value}))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input className="input input-bordered" type="date" value={form.deadline} onChange={e=>setForm(f=>({...f, deadline:e.target.value}))}/>
        </div>
        <input className="input input-bordered w-full" placeholder="Time slot (e.g., Tue 18:00-19:30)" value={form.slot} onChange={e=>setForm(f=>({...f, slot:e.target.value}))}/>
        <button className="btn btn-primary">Add Task</button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-3">My Tasks</h2>
        <div className="space-y-3">
          {tasks.map(t=> (
            <div key={t._id} className={`p-4 rounded-xl shadow flex justify-between ${t.done? 'opacity-60 line-through':''}`}>
              <div>
                <div className="font-semibold">{t.subject} — {t.topic}</div>
                <div className="text-sm opacity-80">Priority: {t.priority} • Deadline: {t.deadline || 'N/A'} • {t.slot}</div>
              </div>
              <button className="btn btn-sm" onClick={()=>toggleDone(t)}>{t.done? 'Undo':'Mark done'}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

