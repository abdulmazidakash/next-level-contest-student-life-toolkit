import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ClassSchedule() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    day: "",
    time: "",
    instructor: "",
    color: "#317371",
  });

  const [editForm, setEditForm] = useState(null); // only for modal editing

  const load = async () => {
    const { data } = await api.get(`/classes/${user.email}`);
    setItems(data || []);
  };

  useEffect(() => {
    if (user?.email) load();
  }, [user?.email]);

  // Add new
  const handleAdd = async (e) => {
    e.preventDefault();
    const timeRegex = /^(?:[01]?\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(form.time)) {
      return Swal.fire("Invalid", "Please enter time as HH:mm (24h)", "warning");
    }

    try {
      const payload = { ...form, email: user.email };
      await api.post("/classes", payload);
      Swal.fire("Added", "Class saved successfully", "success");

      setForm({
        subject: "",
        day: "",
        time: "",
        instructor: "",
        color: "#317371",
      });
      load();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Update existing
  const handleUpdate = async () => {
  try {
    if (!editForm || !editForm._id) {
      return Swal.fire("Error", "No class selected for update", "error");
    }

    const payload = {
      subject: editForm.subject,
      day: editForm.day,
      time: editForm.time,
      instructor: editForm.instructor,
      color: editForm.color,
      email: user.email, // 🔑 important
    };

    console.log('Updating class:', editForm._id, payload);

    const { data } = await api.put(`/classes/${editForm._id}`, payload);

    if (data?.success) {
      Swal.fire("Updated", data.message, "success");
      setEditForm(null);
      document.getElementById("edit_modal").close();
      load();
    } else {
      Swal.fire("Error", data?.message || "Update failed", "error");
    }
  } catch (err) {
    console.error('Update error:', err);
    Swal.fire("Error", err.response?.data?.message || err.message, "error");
  }
};


  // Delete with confirm
  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this class?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      await api.delete(`/classes/${id}`);
      Swal.fire("Deleted!", "Class removed", "success");
      load();
    }
  };

  // Open edit modal
  const openEdit = (item) => {
    setEditForm({ ...item });
    document.getElementById("edit_modal").showModal();
  };

  return (
    <div className="container mx-auto px-4 py-6 grid lg:grid-cols-[1fr_1.618fr] gap-8">
      {/* Add Form */}
      <motion.form
        onSubmit={handleAdd}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="card bg-base-100 shadow-xl p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-xl font-bold text-gray-800">Add Class</h2>
        <input
          className="input input-bordered w-full"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          required
        />
        <select
          className="select select-bordered w-full"
          value={form.day}
          onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
          required
        >
          <option value="" disabled>
            Select day
          </option>
          {"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
            .split(",")
            .map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
        </select>
        <input
          className="input input-bordered w-full"
          placeholder="Time (HH:mm)"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          required
        />
        <input
          className="input input-bordered w-full"
          placeholder="Instructor"
          value={form.instructor}
          onChange={(e) =>
            setForm((f) => ({ ...f, instructor: e.target.value }))
          }
          required
        />
        <input
          className="input input-bordered w-full"
          type="color"
          value={form.color}
          onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
        />

        <button className="btn btn-primary w-full">Save</button>
      </motion.form>

      {/* Class List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">My Classes</h2>
        {items.length === 0 && (
          <div className="alert alert-info">No classes yet</div>
        )}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl shadow-lg bg-white flex flex-col justify-between"
              style={{ borderLeft: `6px solid ${c.color}` }}
            >
              <div>
                <div className="font-semibold text-lg">{c.subject}</div>
                <div className="text-sm opacity-70">
                  {c.day} • {c.time}
                </div>
                <div className="text-sm">{c.instructor}</div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => openEdit(c)}
                >
                  <FiEdit2 className="mr-1" /> Edit
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => remove(c._id)}
                >
                  <FiTrash2 className="mr-1" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <dialog id="edit_modal" className="modal">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="modal-box rounded-2xl"
        >
          <h3 className="font-bold text-lg">Edit Class</h3>
          {editForm && (
            <form method="dialog" className="space-y-3 mt-3">
              <input
                className="input input-bordered w-full"
                placeholder="Subject"
                value={editForm.subject}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
              <select
                className="select select-bordered w-full"
                value={editForm.day}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, day: e.target.value }))
                }
              >
                {"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
                  .split(",")
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
              <input
                className="input input-bordered w-full"
                placeholder="Time"
                value={editForm.time}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, time: e.target.value }))
                }
              />
              <input
                className="input input-bordered w-full"
                placeholder="Instructor"
                value={editForm.instructor}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, instructor: e.target.value }))
                }
              />
              <input
                className="input input-bordered w-full"
                type="color"
                value={editForm.color}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, color: e.target.value }))
                }
              />
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setEditForm(null);
                    document.getElementById("edit_modal").close();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdate}
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </dialog>
    </div>
  );
}
