/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2, FiSearch, FiPlusCircle } from "react-icons/fi";
import { FaBookOpen } from "react-icons/fa";
import { Helmet } from "react-helmet";

export default function ClassSchedule() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    subject: "",
    day: "",
    time: "",
    instructor: "",
    color: "#317371",
  });
  const [editForm, setEditForm] = useState(null);

  const load = async () => {
    const { data } = await api.get(`/classes/${user.email}`);
    setItems(data || []);
  };

  useEffect(() => {
    if (user?.email) load();
  }, [user?.email]);

  // Filter items
  const filteredItems = items.filter((c) =>
    [c.subject, c.day, c.instructor]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Add class
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

  // Update class
  const handleUpdate = async () => {
    try {
      if (!editForm || !editForm._id) {
        return Swal.fire("Error", "No class selected for update", "error");
      }
      const payload = { ...editForm, email: user.email };
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
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  // Delete class
  const remove = async (id) => {
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
      await api.delete(`/classes/${id}`);
      Swal.fire("Deleted!", "Class removed", "success");
      load();
    }
  };

  const openEdit = (item) => {
    setEditForm({ ...item });
    document.getElementById("edit_modal").showModal();
  };

  return (
    
    <>
    <Helmet>
      <title>My Class Schedule | Student Toolkit</title>
    </Helmet>
    <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 my-6"
        >
          <FaBookOpen className="text-[#03A9F4] text-3xl sm:text-4xl md:text-5xl" />
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#03A9F4]">
            My Class Schedule
          </h1>
        </motion.div>
    <div className="container mx-auto px-4 py-6 grid lg:grid-cols-[1fr_1.618fr] gap-8">
      {/* Fixed width form */}
      <motion.form
        onSubmit={handleAdd}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="card bg-base-100 shadow-xl p-6 rounded-2xl space-y-4 border border-gray-200"
      >
        <div className="flex items-center gap-2 justify-center">
          <FiPlusCircle className="text-2xl text-[#03A9F4]" />
          <h2 className="text-xl font-bold text-[#03A9F4]">New Class Task</h2>
        </div>
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
          className="input input-bordered w-20"
          type="color"
          value={form.color}
          onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
        />
        <button className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC] w-full">
          Add Class
        </button>
      </motion.form>

      {/* Class list with search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-bold text-[#03A9F4]">My Classes</h2>
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject, day, instructor..."
              className="input input-bordered w-full pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div className="alert alert-info text-white font-semibold">
            No classes found
          </div>
        )}

        <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-4">
          {filteredItems.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl shadow hover:shadow-lg transition bg-white flex flex-col justify-between border border-gray-200"
              style={{ borderLeft: `6px solid ${c.color}` }}
            >
              <div>
                <div className="font-semibold text-lg">Subject: {c.subject}</div>
                <div className="text-sm opacity-70">
                Day:  {c.day} • Time: {c.time} (h:m)
                </div>
                <div className="text-sm">Instructor: {c.instructor}</div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  className="btn btn-sm text-[#03A9F4] border-[#03A9F4]"
                  onClick={() => openEdit(c)}
                >
                  <FiEdit2 className="font-semibold text-lg" />
                </button>
                <button
                  className="btn btn-sm bg-[#03A9F4] text-white hover:bg-[#0398DC]"
                  onClick={() => remove(c._id)}
                >
                  <FiTrash2 className="font-semibold text-lg" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      <dialog id="edit_modal" className="modal">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="modal-box rounded-2xl bg-blue-50"
        >
          <h3 className="font-bold text-lg text-center text-[#03A9F4]">Edit Class</h3>
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
                className="input input-bordered w-20"
                type="color"
                value={editForm.color}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, color: e.target.value }))
                }
              />
              <div className="modal-action">
                <button
                  type="button"
                  className="btn text-[#03A9F4] border-[#03A9F4]"
                  onClick={() => {
                    setEditForm(null);
                    document.getElementById("edit_modal").close();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC]"
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
    </>
  );
}
