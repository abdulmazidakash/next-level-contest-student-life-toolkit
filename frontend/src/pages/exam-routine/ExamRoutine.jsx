
import Swal from "sweetalert2";
import { FiEdit, FiTrash2, FiPlusCircle } from "react-icons/fi";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import api from "../../services/api";
import { useAuth } from "../../context/AuthProvider";
import { useEffect, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Helmet } from "react-helmet";

export default function ExamRoutine() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  console.log(routines);
  const [form, setForm] = useState({
    date: "",
    day: "",
    courseCode: "",
    courseName: "",
    department: "",
    examTime: "",
  });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const { data } = await api.get(`/exam-routines/${user.email}`);
    setRoutines(data || []);
  };

  useEffect(() => {
    if (user?.email) load();
  }, [user?.email]);

  const openModal = (routine = null) => {
    if (routine) {
      setEditId(routine._id);
      setForm({
        date: routine.date,
        day: routine.day,
        courseCode: routine.courseCode,
        courseName: routine.courseName,
        department: routine.department,
        examTime: routine.examTime,
      });
    } else {
      setEditId(null);
      setForm({ date: "", day: "", courseCode: "", courseName: "", department: "", examTime: "" });
    }
    document.getElementById("routine_modal").showModal();
  };

  const save = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/exam-routines/${editId}`, { ...form, email: user.email });
      Swal.fire("Updated!", "Exam routine updated", "success");
    } else {
      await api.post("/exam-routines", { ...form, email: user.email });
      Swal.fire("Added!", "Exam routine added", "success");
    }
    document.getElementById("routine_modal").close();
    load();
  };

  const remove = async (id) => {
    const ok = await Swal.fire({ title: "Delete?", text: "This action cannot be undone", showCancelButton: true });
    if (ok.isConfirmed) {
      await api.delete(`/exam-routines/${id}`);
      Swal.fire("Deleted!", "Exam routine removed", "success");
      load();
    }
  };

  return (
   <>
    	<Helmet>
		   <title>My Exam Routine | Student Toolkit</title>
		 </Helmet>
   	{/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-3 my-6"
      >
        <FaRegCalendarAlt className="text-[#03A9F4] text-3xl sm:text-4xl md:text-5xl" />
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#03A9F4]">
          My Exam Routine
        </h1>
      </motion.div>
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <button className="btn bg-[#03A9F4] text-white" onClick={() => openModal()}>
          <FiPlusCircle className="mr-2 animate-pulse" /> <span className="animate-pulse">Add Routine</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="table table-zebra w-full text-sm md:text-base">
          <thead className="bg-[#03A9F4] text-white">
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Day</th>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Department</th>
              <th>Exam Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routines.map((r, i) => (
              <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td>{i + 1}</td>
                <td>{r.date}</td>
                <td>{r.day}</td>
                <td>{r.courseCode}</td>
                <td>{r.courseName}</td>
                <td>{r.department}</td>
                <td>{r.examTime}</td>
                <td className="flex gap-2">
                  <button className="btn btn-sm btn-outline text-[#03A9F4]" onClick={() => openModal(r)}>
                    <FiEdit />
                  </button>
                  <button className="btn btn-sm bg-[#03A9F4] text-white" onClick={() => remove(r._id)}>
                    <FiTrash2 />
                  </button>
                </td>
              </motion.tr>
            ))}
            {routines.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 py-4">No routines yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <dialog id="routine_modal" className="modal">
        <div className="modal-box max-w-lg bg-blue-50">
          <h3 className="font-bold text-lg text-[#03A9F4]">
            {editId ? "Edit Routine" : "Add New Routine"}
          </h3>
          <form className="space-y-3 mt-3" onSubmit={save}>
            <input type="date" className="input input-bordered w-full" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
            <input className="input input-bordered w-full" placeholder="Day (e.g., Sunday)" value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))} required />
            <input className="input input-bordered w-full" placeholder="Course Code" value={form.courseCode} onChange={(e) => setForm((f) => ({ ...f, courseCode: e.target.value }))} required />
            <input className="input input-bordered w-full" placeholder="Course Name" value={form.courseName} onChange={(e) => setForm((f) => ({ ...f, courseName: e.target.value }))} required />
            <input className="input input-bordered w-full" placeholder="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} required />
            <input type="time" className="input input-bordered w-full" value={form.examTime} onChange={(e) => setForm((f) => ({ ...f, examTime: e.target.value }))} required />
            <div className="modal-action">
              <button type="submit" className="btn bg-[#03A9F4] text-white">
                {editId ? "Update" : "Add"}
              </button>
              <button type="button" onClick={() => document.getElementById("routine_modal").close()} className="btn text-[#03A9F4] border-[#03A9F4]">Cancel</button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
   </>
  );
}
