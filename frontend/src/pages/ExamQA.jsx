import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaQuestionCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaPenFancy,
} from "react-icons/fa";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthProvider";
import { Helmet } from "react-helmet";

const PHI = 1.618;

export default function ExamQA() {
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [selectedType, setSelectedType] = useState("mcq");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [topic, setTopic] = useState("general knowledge");
  const [userAnswer, setUserAnswer] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false); // ✅ new state

  // Fetch stats
  const fetchStats = async () => {
    if (!user?.email) return;
    try {
      const { data } = await api.get(`/stats/${user.email}`);
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  // Generate new question
  const generateQuestion = async () => {
    setLoadingQ(true);
    try {
      const { data } = await api.post("/generate-question", {
        type: selectedType,
        difficulty: selectedDifficulty,
        topic,
      });
      setQuestion(data);
      setUserAnswer("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoadingQ(false);
    }
  };

  // Submit answer
  const handleSubmit = async () => {
    if (!userAnswer) {
      Swal.fire("Warning", "Please provide an answer", "warning");
      return;
    }
    try {
      const { data } = await api.post("/check-answer", {
        id: question.id,
        userAnswer,
      });

      Swal.fire({
        icon: data.isCorrect ? "success" : "error",
        title: data.isCorrect ? "Correct!" : "Incorrect",
        text: `${data.feedback || ""}\nCorrect Answer: ${data.correctAnswer}`,
      });

      await fetchStats();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  // Load first question + stats
  useEffect(() => {
    if (user?.email) {
      generateQuestion();
      fetchStats();
    }
  }, [user]);

  if (!question) return <Loader />;

  return (
    <>
      <Helmet>
        <title>AI Generate Exam Q & A | Student Toolkit</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-3 my-6 text-center px-2"
      >
        <FaPenFancy className="text-[#03A9F4] text-3xl sm:text-4xl md:text-5xl" />
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#03A9F4]">
          AI Generate Exam Q & A
        </h1>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
          >
            <div className="card shadow p-4 flex flex-col items-center border border-gray-200">
              <FaCheckCircle className="text-green-500 text-3xl mb-2" />
              <span className="font-bold">{stats.correct}</span>
              <span className="text-sm">Correct</span>
            </div>
            <div className="card shadow p-4 flex flex-col items-center border border-gray-200">
              <FaTimesCircle className="text-red-500 text-3xl mb-2" />
              <span className="font-bold">{stats.incorrect}</span>
              <span className="text-sm">Incorrect</span>
            </div>
            <div className="card shadow p-4 flex flex-col items-center border border-gray-200">
              <FaQuestionCircle className="text-blue-500 text-3xl mb-2" />
              <span className="font-bold">{stats.totalAnswered}</span>
              <span className="text-sm">Total Answered</span>
            </div>
          </motion.div>
        )}

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control">
            <label className="label">Question Type</label>
            <select
              className="select select-bordered w-full"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="mcq">MCQ</option>
              <option value="short">Short Answer</option>
              <option value="tf">True/False</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label">Difficulty</label>
            <select
              className="select select-bordered w-full"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label">Topic</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., JavaScript"
            />
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loadingQ}
          className={`btn w-full md:w-auto bg-[#03A9F4] text-white hover:bg-[#0398DC] ${
            loadingQ ? "opacity-70 cursor-not-allowed" : ""
          }`}
          onClick={generateQuestion}
        >
          <FaRedo className="mr-2" />
          {loadingQ ? "Generating..." : "Generate New Question"}
        </motion.button>

        {/* Question Card */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="card shadow p-6 border border-gray-200 hover:shadow-lg break-words"
        >
          <div className="flex items-start gap-2 font-bold text-lg mb-4 flex-wrap">
            <FaQuestionCircle className="mt-1" />{" "}
            <span className="break-words text-justify">{question.question}</span>
          </div>

          {/* Options */}
          {question.type === "mcq" || question.type === "tf" ? (
            <div className="grid gap-2">
              {question.options?.map((op, i) => {
              const key = String.fromCharCode(65 + i);
              return (
                <motion.label
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="label cursor-pointer justify-start gap-2 border border-gray-300 rounded-lg p-2 hover:bg-gray-50 w-full break-words"
                >
                  <input
                    type="radio"
                    name="ans"
                    className="radio"
                    value={key}
                    checked={userAnswer === key}
                    onChange={() => setUserAnswer(key)}
                  />
                  <span className="break-words whitespace-pre-line overflow-hidden text-sm sm:text-base leading-relaxed">
                    {op}
                  </span>
                </motion.label>
              );
            })}

            </div>
          ) : (
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Write your short answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
          )}

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC] flex-1"
              onClick={handleSubmit}
            >
              Submit Answer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn text-[#03A9F4] border-[#03A9F4] flex-1"
              onClick={generateQuestion}
              disabled={loadingQ}
            >
            {loadingQ ? "Generating..." : "Skip To Next"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
