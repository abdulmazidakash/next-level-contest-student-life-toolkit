import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

export default function Budget() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ type: "income", label: "", amount: "" });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false); // modal state

  const load = async () => {
    const { data } = await api.get(`/budgets/${user.email}`);
    setList(data || []);
  };

  useEffect(() => { if (user?.email) load(); }, [user?.email]);

  const add = async (e) => {
    e.preventDefault();
    const amt = Number(form.amount);
    if (isNaN(amt) || amt <= 0) return Swal.fire("Invalid", "Amount must be positive", "warning");

    await api.post('/budgets', { ...form, amount: amt, email: user.email, createdAt: Date.now() });
    Swal.fire("Saved", "Budget item added", "success");
    setForm({ type: "income", label: "", amount: "" });
    load();
  };

    const update = async (e) => {
  e.preventDefault();

  if (!editing) {
    return Swal.fire("Error", "No item selected for editing", "error");
  }

  const amt = Number(form.amount);
  if (isNaN(amt) || amt <= 0) {
    return Swal.fire("Invalid", "Amount must be positive", "warning");
  }

  if (!form.label.trim()) {
    return Swal.fire("Invalid", "Label cannot be empty", "warning");
  }

  try {
    // Use the email from the selected item to ensure match
    const payload = {
      type: form.type,
      label: form.label,
      amount: amt,
      email: form.email
    };

    console.log("Updating budget:", editing, payload);

    await api.put(`/budgets/${editing}`, payload);

    Swal.fire("Updated", "Budget item updated", "success");
    setEditing(null);
    setShowModal(false);
    setForm({ type: "income", label: "", amount: "" });
    load();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", err.response?.data?.message || "Failed to update", "error");
  }
};



  const onEdit = (item) => {
  setForm({ type: item.type, label: item.label, amount: item.amount, email: item.email });
  setEditing(item._id);
  setShowModal(true);
};


  const onDelete = async (id) => {
    const ok = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove the item permanently",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (ok.isConfirmed) {
      await api.delete(`/budgets/${id}`);
      Swal.fire("Deleted", "Budget item removed", "success");
      load();
    }
  };

  const totals = useMemo(() => {
    const income = list.filter(i => i.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = list.filter(i => i.type === 'expense').reduce((a, b) => a + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [list]);

  const pieData = [
    { name: "Income", value: totals.income },
    { name: "Expense", value: totals.expense },
  ];

  const barData = useMemo(() => {
    const map = {};
    list.forEach(i => {
      map[i.label] = (map[i.label] || 0) + i.amount * (i.type === 'expense' ? -1 : 1);
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [list]);

  const filteredList = useMemo(() => {
    if (filter === "all") return list;
    return list.filter(i => i.type === filter);
  }, [list, filter]);

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="stats  border border-gray-300">
        <div className="stat"><div className="stat-title text-[#03A9F4]">Income</div><div className="stat-value text-[#03A9F4]">${totals.income}</div></div>
        <div className="stat"><div className="stat-title text-[#03A9F4]">Expense</div><div className="stat-value text-[#03A9F4]">${totals.expense}</div></div>
        <div className="stat"><div className="stat-title text-[#03A9F4]">Balance</div><div className="stat-value text-[#03A9F4]">${totals.balance}</div></div>
      </div>

      {/* Add Form */}
      <form onSubmit={add} className="card bg-base-100  p-6 grid md:grid-cols-4 gap-3 shadow">
        <select className="select select-bordered" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input className="input input-bordered" placeholder="Label" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
        <input className="input input-bordered" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
        <button className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC]">Add</button>
      </form>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4 border border-gray-300">
          <h3 className="text-lg font-bold mb-2 text-[#03A9F4]">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card border border-gray-300 bg-base-100 shadow p-4">
          <h3 className="text-lg font-bold mb-2 text-[#03A9F4]">By Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#03A9F4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table + Filter */}
      <div className="overflow-x-auto space-y-3">
        <div className="flex justify-end">
          <select
            className="select select-bordered"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <table className="table">
          <thead className="">
            <tr className="text-[#03A9F4]"><th>Type</th><th>Label</th><th>Amount</th><th>When</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filteredList.map((i) => (
              <tr key={i._id}>
                <td><span className={`badge ${i.type === 'income' ? 'badge-success' : 'badge-error'}`}>{i.type}</span></td>
                <td>{i.label}</td>
                <td>${i.amount}</td>
                <td>{new Date(i.createdAt).toLocaleString()}</td>
                <td className="space-x-2">
                  <button className="btn btn-xs btn-outline" onClick={() => onEdit(i)}>Edit</button>
                  <button className="btn btn-xs btn-error" onClick={() => onDelete(i._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
     {/* Edit Modal */}
{showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="card bg-base-100 shadow-lg w-96 p-6">
      <h3 className="text-lg font-bold mb-4">Edit Budget Item</h3>
      <form onSubmit={update} className="space-y-3">
        <select
          className="select select-bordered w-full"
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          className="input input-bordered w-full"
          placeholder="Label"
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          required
        />
        <input
          className="input input-bordered w-full"
          placeholder="Amount"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          required
        />
        <div className="flex justify-end space-x-2">
          {/* <button
            type="button"
            className="btn"
            onClick={() => {
              setShowModal(false);
              setEditing(null); // <-- Reset editing state
              setForm({ type: "income", label: "", amount: "" }); // <-- Reset form state
            }}
          >
            Cancel
          </button> */}

          <button
            type="button"
            className="btn"
            onClick={() => {
              setShowModal(false);
              setEditing(null);
              setForm({ type: "income", label: "", amount: "" }); // email cleared
            }}
          >
            Cancel
          </button>

          <button type="submit" className="btn btn-primary">Update</button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}
