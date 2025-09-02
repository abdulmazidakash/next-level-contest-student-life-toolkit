import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiUser, FiBook, FiDollarSign, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthProvider";
import api from "../../services/api";
import Loader from "../../components/Loader";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/profile/${user.email}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.email]);

  if (loading) return <Loader/>;
  if (!profile) return <div className="text-center py-10">Profile not found</div>;

  return (
    <motion.div
      className="max-w-5xl mx-auto p-4 md:p-8 space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Profile Card */}
      <motion.div
        className="flex flex-col md:flex-row items-center md:items-start bg-white shadow-lg border border-gray-200 rounded-2xl p-6 gap-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
		 referrerPolicy="no-referrer" 
          src={profile.photoURL || "https://i.pravatar.cc/150?img=3"}
          alt={profile.name}
          className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-2 border-[#FFD700]"
        />
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold text-[#03A9F4]">{profile.name}</h2>
          <p className="text-gray-600">Email: {profile.email}</p>
          <p className="text-gray-600">Role: {profile.role}</p>
          <p className="text-gray-600">
            Joined: {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards - Golden Ratio Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-[#FFD700]/20 rounded-xl p-4 flex flex-col items-center justify-center shadow"
          whileHover={{ scale: 1.05 }}
        >
          <FiBook className="text-3xl text-[#FFD700]" />
          <p className="mt-2 text-gray-700 font-semibold">Classes</p>
          <p className="text-2xl font-bold">{profile.stats.totalClasses}</p>
        </motion.div>

        <motion.div
          className="bg-[#22c55e]/20 rounded-xl p-4 flex flex-col items-center justify-center shadow"
          whileHover={{ scale: 1.05 }}
        >
          <FiDollarSign className="text-3xl text-[#22c55e]" />
          <p className="mt-2 text-gray-700 font-semibold">Budget Items</p>
          <p className="text-2xl font-bold">{profile.stats.totalBudgetItems}</p>
        </motion.div>

        <motion.div
          className="bg-[#3b82f6]/20 rounded-xl p-4 flex flex-col items-center justify-center shadow"
          whileHover={{ scale: 1.05 }}
        >
          <FiCheckCircle className="text-3xl text-[#3b82f6]" />
          <p className="mt-2 text-gray-700 font-semibold">Tasks</p>
          <p className="text-2xl font-bold">{profile.stats.totalTasks}</p>
        </motion.div>

        <motion.div
          className="bg-[#f59e0b]/20 rounded-xl p-4 flex flex-col items-center justify-center shadow"
          whileHover={{ scale: 1.05 }}
        >
          <FiUser className="text-3xl text-[#f59e0b]" />
          <p className="mt-2 text-gray-700 font-semibold">Role</p>
          <p className="text-2xl font-bold">{profile.role}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
