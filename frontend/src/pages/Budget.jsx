import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { FiEdit2, FiFilter, FiTrash2, FiTrendingUp, FiDollarSign, FiPieChart, FiBarChart2 } from "react-icons/fi";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"; // 🌀 motion import
import { FaWallet } from "react-icons/fa";
import { Helmet } from "react-helmet";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

export default function Budget() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ type: "income", label: "", amount: "" });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

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
    if (!editing) return Swal.fire("Error", "No item selected for editing", "error");

    const amt = Number(form.amount);
    if (isNaN(amt) || amt <= 0) return Swal.fire("Invalid", "Amount must be positive", "warning");

    try {
      const payload = { ...form, amount: amt, email: form.email };
      await api.put(`/budgets/${editing}`, payload);
      Swal.fire("Updated", "Budget item updated", "success");
      setEditing(null);
      setShowModal(false);
      setForm({ type: "income", label: "", amount: "" });
      load();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update", "error");
    }
  };

  const onEdit = (item) => {
    setForm({ type: item.type, label: item.label, amount: item.amount, email: item.email });
    setEditing(item._id);
    setShowModal(true);
  };

  const onDelete = async (id) => {
    const confirm = await Swal.fire({
          title: "Are you sure?",
          text: "Do you want to delete this class?",
          icon: "warning",
          showCancelButton: true,
          background: "#FFF9F1", // alert background
          color: "#317371",       // text color
          confirmButtonColor: "#03A9F4", // confirm button background
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
        });
    if (confirm.isConfirmed) {
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
    if (!map[i.label]) {
      map[i.label] = { label: i.label, income: 0, expense: 0 };
    }
    if (i.type === "income") {
      map[i.label].income += i.amount;
    } else {
      map[i.label].expense += i.amount;
    }
  });
  return Object.values(map);
}, [list]);

  const filteredList = useMemo(() => {
    if (filter === "all") return list;
    return list.filter(i => i.type === filter);
  }, [list, filter]);

  return (
    <>
    <Helmet>
      <title>My Budget Track | Student Toolkit</title>
    </Helmet>
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-3 my-6"
    >
      <FaWallet className="text-[#03A9F4] text-3xl sm:text-4xl md:text-5xl" />
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#03A9F4]">
        My Budget Track
      </h1>
    </motion.div>
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Summary stats */}
      <motion.div
        className="stats border border-gray-300 shadow-md"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="stat">
          <div className="stat-title flex items-center gap-1 text-[#03A9F4]">
            <FiTrendingUp /> Income
          </div>
          <div className="stat-value text-[#03A9F4]">${totals.income}</div>
        </div>
        <div className="stat">
          <div className="stat-title flex items-center gap-1 text-[#03A9F4]">
            <FiTrash2 /> Expense
          </div>
          <div className="stat-value text-[#03A9F4]">${totals.expense}</div>
        </div>
        <div className="stat">
          <div className="stat-title flex items-center gap-1 text-[#03A9F4]">
            <FiDollarSign /> Balance
          </div>
          <div className="stat-value text-[#03A9F4]">${totals.balance}</div>
        </div>
      </motion.div>

      {/* Add Form */}
      <motion.form
        onSubmit={add}
        className="card bg-base-100 p-6 grid md:grid-cols-4 gap-3 shadow"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <select className="select select-bordered" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input type="text" className="input input-bordered" placeholder="Label" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
        <input type="number" className="input input-bordered" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
        <button className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC]">Add</button>
      </motion.form>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          className="card bg-base-100 shadow p-4 border border-gray-300"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-bold mb-2 text-[#03A9F4] flex items-center gap-2">
            <FiPieChart /> Income vs Expense
          </h3>
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
        </motion.div>

        <motion.div
          className="card border border-gray-300 bg-base-100 shadow p-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-bold mb-2 text-[#03A9F4] flex items-center gap-2">
            <FiBarChart2 /> By Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Table + Filter */}
      <motion.div
        className="overflow-x-auto space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-end">
          <FiFilter className="mr-2 text-[#03A9F4] font-bold" /><span className="font-bold text-[#03A9F4] mr-2">Filter:</span>
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
          <thead>
            <tr className="text-[#03A9F4]"><th>Type</th><th>Label</th><th>Amount</th><th>When</th><th>Action</th></tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredList.map((i) => (
                <motion.tr
                  key={i._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <td><span className={`badge ${i.type === 'income' ? 'badge-success' : 'badge-error'}`}>{i.type}</span></td>
                  <td>{i.label}</td>
                  <td>${i.amount}</td>
                  <td>{new Date(i.createdAt).toLocaleString()}</td>
                  <td className="space-x-2">
                    <button className="btn btn-xs text-[#03A9F4] border-[#03A9F4]" onClick={() => onEdit(i)}><FiEdit2 /></button>
                    <button className="btn btn-xs bg-[#03A9F4] text-white hover:bg-[#0398DC]" onClick={() => onDelete(i._id)}><FiTrash2 /></button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card bg-blue-50 shadow-lg w-96 p-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-4 text-center text-[#03A9F4]">Edit Budget Item</h3>
              <form onSubmit={update} className="space-y-3">
                <select className="select select-bordered w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input className="input input-bordered w-full" placeholder="Label" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
                <input className="input input-bordered w-full" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="btn text-[#03A9F4] border-[#03A9F4]"
                    onClick={() => {
                      setShowModal(false);
                      setEditing(null);
                      setForm({ type: "income", label: "", amount: "" });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC]">Update</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}
