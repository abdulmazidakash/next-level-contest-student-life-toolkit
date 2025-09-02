import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiPlusCircle,
  FiCalendar,
  FiClock,
  FiFlag,
  FiSearch,
  FiCheckCircle,
  FiRotateCcw,
  FiTrash2,
} from "react-icons/fi";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const daySlotRegex =
  /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s(?:[01]?\d|2[0-3]):[0-5]\d-(?:[01]?\d|2[0-3]):[0-5]\d$/i;

function PriorityBadge({ value }) {
  const styles =
    value === "high"
      ? "badge-error"
      : value === "medium"
      ? "badge-warning"
      : "badge-success";
  return <span className={`badge ${styles} capitalize`}>{value}</span>;
}

export default function StudyPlanner() {
  const { user } = useAuth();

  // Data
  const [tasks, setTasks] = useState([]);

  // Form state
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    priority: "medium",
    deadline: "",
    slot: "", // e.g. Tue 18:00-19:30
  });

  // UI state - search & filters
  const [q, setQ] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load
  const load = async () => {
    const { data } = await api.get(`/planners/${user.email}`);
    setTasks(data || []);
  };

  useEffect(() => {
    if (user?.email) load();
  }, [user?.email]);

  // Validate form
  const validate = () => {
    if (!form.subject.trim() || !form.topic.trim()) {
      Swal.fire("Missing", "Subject and topic are required", "warning");
      return false;
    }
    if (!["low", "medium", "high"].includes(form.priority)) {
      Swal.fire("Invalid", "Priority must be Low/Medium/High", "warning");
      return false;
    }
    if (!form.deadline) {
      Swal.fire("Missing", "Please choose a deadline", "warning");
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ddl = new Date(form.deadline);
    if (ddl < today) {
      Swal.fire("Invalid", "Deadline cannot be in the past", "warning");
      return false;
    }
    if (form.slot && !daySlotRegex.test(form.slot.trim())) {
      Swal.fire(
        "Invalid",
        "Time slot must look like: Tue 18:00-19:30 (3-letter day + HH:mm-HH:mm, 24h)",
        "warning"
      );
      return false;
    }
    return true;
  };

  // Add task
  const add = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      email: user.email,
      done: false,
      createdAt: Date.now(),
    };

    await api.post("/planners", payload);
    Swal.fire("Added", "Task added to plan", "success");
    setForm({ subject: "", topic: "", priority: "medium", deadline: "", slot: "" });
    load();
  };

  // Permanent toggle (PATCH to server)
  const toggleDone = async (t) => {
    try {
      await api.patch(`/planners/toggle/${t._id}`);
      // refresh from server to reflect true state
      await load();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update", "error");
    }
  };



  // Derived: filter + search + sort
  const filteredSorted = useMemo(() => {
    let list = [...tasks];

    // search by subject/topic (case-insensitive)
    const qx = q.trim().toLowerCase();
    if (qx) {
      list = list.filter(
        (t) =>
          t.subject?.toLowerCase().includes(qx) ||
          t.topic?.toLowerCase().includes(qx)
      );
    }

    if (priorityFilter !== "all") {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    if (statusFilter !== "all") {
      const flag = statusFilter === "done";
      list = list.filter((t) => t.done === flag);
    }

    // sort: undone first, then priority high->low, then earliest deadline, then subject
    list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const pa = PRIORITY_ORDER[a.priority] ?? 3;
      const pb = PRIORITY_ORDER[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      if (da !== db) return da - db;
      return (a.subject || "").localeCompare(b.subject || "");
    });

    return list;
  }, [tasks, q, priorityFilter, statusFilter]);

  
  // Delete task
  const deleteTask = async (id) => {
  if (!id) return Swal.fire("Error", "Invalid task ID", "error");

  const confirm = await Swal.fire({
    title: "Delete task?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (confirm.isConfirmed) {
    try {
      const { data } = await api.delete(`/planners/${id}`);
      if (data?.deletedCount === 0) {
        Swal.fire("Not found", "Task already deleted or not exist", "info");
      } else {
        Swal.fire("Deleted!", "Your task has been removed.", "success");
        load();
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to delete task", "error");
    }
  }
};


  return (
    <div className="container mx-auto px-4 py-6 grid gap-8 lg:grid-cols-[1fr_1.618fr]">
      {/* Left: Add Form (golden ratio left pane) */}
      <motion.form
        onSubmit={add}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="card bg-base-100 shadow-xl p-6 rounded-2xl space-y-4 border border-gray-200"
      >
        <div className="flex items-center gap-2 justify-center">
          <FiPlusCircle className="text-2xl text-[#03A9F4]" />
          <h2 className="text-xl font-bold text-[#03A9F4]">New Study Task</h2>
        </div>

        <input
          className="input input-bordered w-full"
          placeholder="Subject (e.g., Physics)"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          required
        />
        <input
          className="input input-bordered w-full"
          placeholder="Topic (e.g., Optics: Lenses)"
          value={form.topic}
          onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <FiFlag className="opacity-70 text-[#03A9F4]" />
            <select
              className="select select-bordered w-full"
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FiCalendar className="opacity-70 text-[#03A9F4]" />
            <input
              className="input input-bordered w-full"
              type="date"
              value={form.deadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, deadline: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FiClock className="opacity-70 text-[#03A9F4]" />
          <input
            className="input input-bordered w-full"
            placeholder="Time slot (e.g., Tue 18:00-19:30) — optional"
            value={form.slot}
            onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
          />
        </div>

        <button className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC] w-full">
          Add Task
        </button>

        <p className="text-xs opacity-70">
          Tip: Break large goals into smaller topics and assign a specific slot.
        </p>
      </motion.form>

      {/* Right: Search + List (golden ratio right pane) */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        {/* Search & Filters */}
        <div className="card bg-base-100 shadow p-4 rounded-2xl border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1">
              <FiSearch className="opacity-70 text-[#03A9F4]" />
              <input
                className="input input-bordered w-full"
                placeholder="Search by subject or topic"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                className="select select-bordered"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="todo">To-do</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-4">
          {filteredSorted.length === 0 && (
            <div className="col-span-full alert alert-info">No tasks found</div>
          )}

          {filteredSorted.map((t, i) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-4 rounded-xl shadow hover:shadow-lg transition bg-white border border-gray-200 flex flex-col justify-between ${
                t.done ? "opacity-70" : ""
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {t.subject} — <span className="font-normal">{t.topic}</span>
                  </h3>
                  <PriorityBadge value={t.priority} />
                </div>
                <div className="text-sm opacity-80">
                  <span className="mr-2">
                    <FiCalendar className="inline mr-1 text-[#03A9F4]" />
                    {t.deadline || "N/A"}
                  </span>
                  {t.slot ? (
                    <span>
                      <FiClock className="inline mr-1 text-[#03A9F4]" />
                      {t.slot}
                    </span>
                  ) : null}
                </div>
              </div>
              
              {/* mark done and delete button  */}

              <div className="flex justify-end mt-3 gap-2">
                <button
                  className={`btn btn-sm ${
                    t.done
                      ? "btn-outline text-[#03A9F4] border-[#03A9F4]"
                      : "bg-[#03A9F4] text-white hover:bg-[#0398DC]"
                  }`}
                  onClick={() => toggleDone(t)}
                  title={t.done ? "Mark as to-do" : "Mark as done"}
                >
                  {t.done ? (
                    <>
                      <FiRotateCcw className="mr-1" /> Undo
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="mr-1" /> Mark done
                    </>
                  )}
                </button>

                {/* Delete button */}
                <button
                  className="btn btn-sm btn-outline text-[#03A9F4] border-[#03A9F4]"
                  onClick={() => deleteTask(t._id)}
                  title="Delete task"
                >
                  <FiTrash2 className="mr-1 text-xl text-center mx-auto" />
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
