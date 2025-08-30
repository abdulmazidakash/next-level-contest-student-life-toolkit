
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";

export default function Budget(){
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ type: "income", label: "", amount: "" });

  const load = async ()=>{
    const { data } = await api.get(`/budgets/${user.email}`);
    setList(data || []);
  }
  useEffect(()=>{ if(user?.email) load(); },[user?.email]);

  const add = async (e)=>{
    e.preventDefault();
    const amt = Number(form.amount);
    if(isNaN(amt) || amt <= 0) return Swal.fire("Invalid", "Amount must be positive", "warning");
    const payload = { ...form, amount: amt, email: user.email, createdAt: Date.now() };
    await api.post('/budgets', payload);
    Swal.fire("Saved", "Budget item added", "success");
    setForm({ type: "income", label: "", amount: "" });
    load();
  }

  const totals = useMemo(()=>{
    const income = list.filter(i=>i.type==='income').reduce((a,b)=>a+b.amount,0);
    const expense = list.filter(i=>i.type==='expense').reduce((a,b)=>a+b.amount,0);
    return { income, expense, balance: income - expense };
  },[list]);

  return (
    <div className="space-y-6">
      <div className="stats shadow">
        <div className="stat"><div className="stat-title">Income</div><div className="stat-value">${totals.income}</div></div>
        <div className="stat"><div className="stat-title">Expense</div><div className="stat-value">${totals.expense}</div></div>
        <div className="stat"><div className="stat-title">Balance</div><div className="stat-value">${totals.balance}</div></div>
      </div>

      <form onSubmit={add} className="card bg-base-100 shadow p-6 grid md:grid-cols-4 gap-3">
        <select className="select select-bordered" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input className="input input-bordered" placeholder="Label" value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} required/>
        <input className="input input-bordered" placeholder="Amount" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} required/>
        <button className="btn btn-primary">Add</button>
      </form>

      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr><th>Type</th><th>Label</th><th>Amount</th><th>When</th></tr></thead>
          <tbody>
            {list.map((i)=> (
              <tr key={i._id}>
                <td><span className={`badge ${i.type==='income'?'badge-success':'badge-error'}`}>{i.type}</span></td>
                <td>{i.label}</td>
                <td>${i.amount}</td>
                <td>{new Date(i.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

