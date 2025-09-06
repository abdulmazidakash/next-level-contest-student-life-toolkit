
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlusCircle,
  FiCalendar,
  FiClock,
  FiFlag,
  FiSearch,
  FiCheckCircle,
  FiRotateCcw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { FaTasks } from "react-icons/fa";
import { Helmet } from "react-helmet";

// Priority order for sorting
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const daySlotRegex =
  /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s(?:[01]?\d|2[0-3]):[0-5]\d-(?:[01]?\d|2[0-3]):[0-5]\d$/i;

// Priority badge component
function PriorityBadge({ value }) {
  const styles =
    value === "high"
      ? "badge-error"
      : value === "medium"
      ? "badge-warning"
      : "badge-success";
  return <span className={`badge ${styles} capitalize`}>{value}</span>;
}

// Animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

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
    slot: "",
  });
  // UI state - search, filters, modal
  const [q, setQ] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load tasks
  const load = async () => {
    try {
      const { data } = await api.get(`/planners/${user.email}`);
      setTasks(data || []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to load tasks", "error");
    }
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
    try {
      const payload = {
        ...form,
        email: user.email,
        done: false,
        createdAt: Date.now(),
      };
      await api.post("/planners", payload);
      Swal.fire("Added", "Task added to plan", "success");
      setForm({ subject: "", topic: "", priority: "medium", deadline: "", slot: "" });
      setIsModalOpen(false);
      load();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to add task", "error");
    }
  };

  // Toggle task status
  const toggleDone = async (t) => {
    try {
      await api.patch(`/planners/toggle/${t._id}`);
      await load();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update", "error");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!id) return Swal.fire("Error", "Invalid task ID", "error");
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this task?",
      icon: "warning",
      showCancelButton: true,
      background: "#FFF9F1",
      color: "#317371",
      confirmButtonColor: "#03A9F4",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
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

  // Filter and sort tasks
  const { todoTasks, doneTasks } = useMemo(() => {
    let list = [...tasks];
    // Search
    const qx = q.trim().toLowerCase();
    if (qx) {
      list = list.filter(
        (t) =>
          t.subject?.toLowerCase().includes(qx) ||
          t.topic?.toLowerCase().includes(qx)
      );
    }
    // Priority filter
    if (priorityFilter !== "all") {
      list = list.filter((t) => t.priority === priorityFilter);
    }
    // Status filter
    if (statusFilter !== "all") {
      const flag = statusFilter === "done";
      list = list.filter((t) => t.done === flag);
    }
    // Sort: priority high->low, then earliest deadline, then subject
    list.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 3;
      const pb = PRIORITY_ORDER[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      if (da !== db) return da - db;
      return (a.subject || "").localeCompare(b.subject || "");
    });
    // Split into todo and done
    return {
      todoTasks: list.filter((t) => !t.done),
      doneTasks: list.filter((t) => t.done),
    };
  }, [tasks, q, priorityFilter, statusFilter]);

  return (
    <>
      <Helmet>
        <title>My Study Plan | Student Toolkit</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-3 my-6 px-4"
      >
        <FaTasks className="text-[#03A9F4] text-3xl sm:text-4xl md:text-5xl" />
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#03A9F4]">
          My Study Plan
        </h1>
      </motion.div>
      <div className="container mx-auto px-4 py-6">
        {/* Add Task Button and Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card bg-base-100 shadow p-4 rounded-lg border border-gray-200 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <button
              className="btn btn-sm lg:btn-md bg-[#03A9F4] text-white hover:bg-[#0398DC] flex items-center gap-2 w-full lg:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              <FiPlusCircle className="text-xl" /> Add New Task
            </button>
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
              <div className="flex items-center gap-2 flex-1">
                <FiSearch className="opacity-70 text-[#03A9F4]" />
                <input
                  className="input input-bordered w-full"
                  placeholder="Search by subject or topic"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
                <select
                  className="select select-bordered w-full sm:w-auto"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  className="select select-bordered w-full sm:w-auto"
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
        </motion.div>

        {/* Modal for Adding Task */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="modal modal-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-box w-full max-w-[90vw] sm:max-w-md p-4 sm:p-6 bg-blue-50"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#03A9F4] flex items-center gap-2">
                    <FiPlusCircle className="text-2xl" /> New Study Task
                  </h2>
                  <button
                    className="btn btn-sm btn-circle btn-ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <FiX className="text-xl text-[#03A9F4]" />
                  </button>
                </div>
                <form onSubmit={add} className="space-y-3">
                  <div className="form-control">

                    <input
                      className="input input-bordered w-full text-sm"
                      placeholder="Subject (e.g., Physics)"
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-control">

                    <input
                      className="input input-bordered w-full text-sm"
                      placeholder="Topic (e.g., Optics: Lenses)"
                      value={form.topic}
                      onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-sm">Priority</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <FiFlag className="opacity-70 text-[#03A9F4]" />
                        <select
                          className="select select-bordered w-full text-sm"
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
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-sm">Deadline</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="opacity-70 text-[#03A9F4]" />
                        <input
                          className="input input-bordered w-full text-sm"
                          type="date"
                          value={form.deadline}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, deadline: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-control">
                    <div className="flex items-center gap-2">
                      <FiClock className="opacity-70 text-[#03A9F4]" />
                      <input
                        className="input input-bordered w-full text-sm"
                        placeholder="Time slot (e.g., Tue 18:00-19:30)"
                        value={form.slot}
                        onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                    <button
                      type="button"
                      className="btn btn-sm text-[#03A9F4] border-[#03A9F4] w-full sm:w-auto"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm bg-[#03A9F4] text-white hover:bg-[#0398DC] w-full sm:w-auto"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
                <p className="text-xs opacity-70 mt-4 text-center">
                  Tip: Break large goals into smaller topics and assign a specific slot.
                </p>
              </motion.div>
              <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Lists */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* To-Do Tasks (Left, 2-column grid on sm and up) */}
          <div>
            <h2 className="text-xl font-semibold text-white bg-[#03A9F4] p-2 mb-4 rounded-lg text-center">
              To-Do Tasks: {todoTasks.length}
            </h2>
            {todoTasks.length === 0 && (
              <div className="alert alert-info">No to-do tasks found</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todoTasks.map((t, i) => (
                <motion.div
                  key={t._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-lg shadow hover:shadow-lg transition bg-white border border-gray-200 flex flex-col justify-between"
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
                  <div className="flex justify-end mt-3 gap-2">
                    <button
                      className="btn btn-sm bg-[#03A9F4] text-white hover:bg-[#0398DC]"
                      onClick={() => toggleDone(t)}
                      title="Mark as done"
                    >
                      <FiCheckCircle className="mr-1" /> Mark done
                    </button>
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
          </div>

          {/* Done Tasks (Right, 1-column grid) */}
          <div>
            <h2 className="text-xl font-semibold text-white bg-[#03A9F4] p-2 mb-4 rounded-lg text-center">
              Completed Tasks: {doneTasks.length}
            </h2>
            {doneTasks.length === 0 && (
              <div className="alert alert-info">No completed tasks found</div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {doneTasks.map((t, i) => (
                <motion.div
                  key={t._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-lg shadow hover:shadow-lg transition bg-white border border-gray-200 flex flex-col justify-between opacity-70"
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
                  <div className="flex justify-end mt-3 gap-2">
                    <button
                      className="btn btn-sm btn-outline text-[#03A9F4] border-[#03A9F4]"
                      onClick={() => toggleDone(t)}
                      title="Mark as to-do"
                    >
                      <FiRotateCcw className="mr-1" /> Undo
                    </button>
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
          </div>
        </motion.div>
      </div>
    </>
  );
}
