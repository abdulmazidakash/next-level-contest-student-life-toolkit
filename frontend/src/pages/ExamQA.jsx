import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaRedo } from "react-icons/fa";

// Golden ratio constant for UI proportions (approx 1.618)
const PHI = 1.618;

export default function ExamQA() {
  const [question, setQuestion] = useState(null);
  const [selectedType, setSelectedType] = useState("mcq");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [topic, setTopic] = useState("general knowledge");
  const [userAnswer, setUserAnswer] = useState("");

  const generateQuestion = async () => {
    try {
      const { data } = await api.post("/generate-question", {
        type: selectedType,
        difficulty: selectedDifficulty,
        topic,
      });
      setQuestion(data);
      setUserAnswer("");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

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
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  if (!question) return <div className="text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Controls Section with Golden Ratio proportions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        style={{ maxWidth: `${100 / PHI}%` }} // Apply golden ratio to width
      >
        <div className="form-control">
          <label className="label">Question Type</label>
          <select
            className="select select-bordered"
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
            className="select select-bordered"
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
            className="input input-bordered"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., JavaScript"
          />
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-secondary w-full md:w-auto"
        onClick={generateQuestion}
        style={{ width: `${100 / PHI}%` }} // Golden ratio button width
      >
        <FaRedo className="mr-2" /> Generate New Question
      </motion.button>

      {/* Question Display with Animation */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="card bg-base-100 shadow-xl p-6"
        style={{ aspectRatio: PHI }} // Golden ratio aspect for card
      >
        <div className="flex items-center gap-2 font-bold text-lg mb-4">
          <FaQuestionCircle /> {question.question}
        </div>
        {question.type === "mcq" && (
          <div className="grid gap-2">
            {question.options?.map((op, i) => (
              <motion.label
                key={i}
                whileHover={{ scale: 1.02 }}
                className="label cursor-pointer justify-start gap-2"
              >
                <input
                  type="radio"
                  name="ans"
                  className="radio"
                  value={op}
                  onChange={() => setUserAnswer(op)}
                />
                <span>{op}</span>
              </motion.label>
            ))}
          </div>
        )}
        {question.type === "tf" && (
          <div className="grid gap-2">
            {question.options?.map((op, i) => (
              <motion.label
                key={i}
                whileHover={{ scale: 1.02 }}
                className="label cursor-pointer justify-start gap-2"
              >
                <input
                  type="radio"
                  name="ans"
                  className="radio"
                  value={op}
                  onChange={() => setUserAnswer(op)}
                />
                <span>{op}</span>
              </motion.label>
            ))}
          </div>
        )}
        {question.type === "short" && (
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Write your short answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
        )}
        <div className="mt-6 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary flex-1"
            onClick={handleSubmit}
          >
            Submit Answer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline flex-1"
            onClick={generateQuestion}
          >
            Skip to Next
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
