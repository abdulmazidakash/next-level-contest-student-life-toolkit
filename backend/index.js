// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//mongodb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o1alckr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// verify JWT middleware
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send({ message: 'Unauthorized access' });
  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'dev_secret', (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Invalid or expired token' });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    // await client.connect(); // optional for newer drivers
    const db = client.db('student-life-toolkit');
    const usersCol = db.collection('users');
    const classesCol = db.collection('classes');
    const budgetsCol = db.collection('budgets');
    const plannersCol = db.collection('planners');
    const questionsCol = db.collection('questions');
    const statsCol = db.collection("stats");

    // -----------------------
    // JWT creation endpoint
    // -----------------------
    app.post('/jwt', async (req, res) => {
      const user = req.body; // expected: { email }
      if (!user?.email) return res.status(400).send({ message: 'email required' });
      const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET || 'dev_secret', { expiresIn: '6h' });
      res.send({ token });
    });

    // -----------------------
    // Users: upsert and get
    // -----------------------
    app.post('/users/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const payload = req.body;
        if (!email) return res.status(400).send({ message: 'email missing' });

        const existing = await usersCol.findOne({ email });
        if (existing) return res.send(existing);

        const doc = {
          email,
          name: payload.name || '',
          photoURL: payload.photoURL || '',
          role: payload.role || 'student',
          createdAt: Date.now(),
        };
        const result = await usersCol.insertOne(doc);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    app.get('/users/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCol.findOne({ email });
        res.send(user || {});
      } catch (err) {
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    // GET student profile
    app.get('/profile/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCol.findOne({ email });
        if (!user) return res.status(404).send({ message: 'User not found' });

        // Optionally include summary stats
        const totalClasses = await classesCol.countDocuments({ email });
        const totalBudgetItems = await budgetsCol.countDocuments({ email });
        const totalTasks = await plannersCol.countDocuments({ email });

        res.send({
          email: user.email,
          name: user.name,
          photoURL: user.photoURL,
          role: user.role,
          createdAt: user.createdAt,
          stats: {
            totalClasses,
            totalBudgetItems,
            totalTasks
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to fetch profile' });
      }
    });

    // -----------------------
    // QUESTIONS (seed + generate with Gemini)
    // -----------------------
    // sample question shape:
    // {
    // type: 'mcq' | 'short' | 'tf',
    // question: '...',
    // options: ['a','b','c','d'] (for mcq/tf),
    // answer: '...' (for all)
    // }
    // Seed sample questions (run once in dev)
    app.post('/seed-questions', async (req, res) => {
      try {
        const sample = [
          {
            type: 'mcq',
            question: 'Which method is used to add an element at the end of an array in JavaScript?',
            options: ['push()', 'pop()', 'shift()', 'unshift()'],
            answer: 'push()'
          },
          {
            type: 'mcq',
            question: 'What does CSS stand for?',
            options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System', 'Coded Style Syntax'],
            answer: 'Cascading Style Sheets'
          },
          {
            type: 'short',
            question: 'Write the HTML tag for creating a link.',
            answer: '<a href=\"...\">...</a>'
          },
          {
            type: 'tf',
            question: 'The HTTP status code 404 means Not Found.',
            options: ['true', 'false'],
            answer: 'true'
          }
        ];
        const result = await questionsCol.insertMany(sample);
        res.send({ inserted: result.insertedCount });
      } catch (err) {
        res.status(500).send({ message: 'Failed to seed questions' });
      }
    });
    // Generate a question using Gemini AI
    app.post('/generate-question', verifyToken, async (req, res) => {
      try {
        const { type, difficulty, topic = 'general knowledge' } = req.body;
        if (!type || !difficulty) {
          return res.status(400).send({ message: 'type and difficulty required' });
        }
        if (!['mcq', 'short', 'tf'].includes(type)) {
          return res.status(400).send({ message: 'Invalid type: mcq, short, or tf' });
        }
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
          return res.status(400).send({ message: 'Invalid difficulty: easy, medium, or hard' });
        }
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        let prompt = `Generate a ${difficulty} ${type.toUpperCase()} question on ${topic}. `;
        prompt += 'Output only the raw JSON object, without any markdown, code blocks, or additional text. ';
        if (type === 'mcq') {
          prompt += 'Provide 4 options (A, B, C, D) with one correct. JSON format: {"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}';
        } else if (type === 'tf') {
          prompt += 'Provide true/false question. JSON format: {"question": "...", "options": ["true", "false"], "answer": "true"}';
        } else if (type === 'short') {
          prompt += 'Provide a short answer question with a sample answer. JSON format: {"question": "...", "answer": "..."}';
        }
        prompt += ' Ensure the JSON is valid and complete.';
        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();
        // Strip any potential markdown code blocks
        responseText = responseText.replace(/^```json\n?|\n?```$/g, '').trim();
        // Parse JSON from response
        let generated;
        try {
          generated = JSON.parse(responseText);
        } catch (parseErr) {
          console.error('Parse error:', parseErr, responseText);
          return res.status(500).send({ message: 'Failed to parse AI response' });
        }
        // For tf, ensure options if missing
        if (type === 'tf' && !generated.options) {
          generated.options = ['true', 'false'];
        }
        // Store in DB for history if needed
        const insertResult = await questionsCol.insertOne({
          ...generated,
          type,
          difficulty,
          topic,
          createdAt: Date.now(),
        });
        // Return without answer for client
        const { answer, ...clientPayload } = generated;
        res.send({ ...clientPayload, id: insertResult.insertedId, type, difficulty, topic });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to generate question' });
      }
    });

    // (Optional) Add single question (admin)
    app.post('/questions', verifyToken, async (req, res) => {
      try {
        const payload = req.body;
        if (!payload.type || !payload.question) return res.status(400).send({ message: 'type and question required' });
        const result = await questionsCol.insertOne({ ...payload, createdAt: Date.now() });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: 'Failed to add question' });
      }
    });

    // ✅ Check Answer endpoint with debug logs
    app.post("/check-answer", verifyToken, async (req, res) => {
      try {
        const { id, userAnswer } = req.body;
        const email = req.decoded.email; // from JWT

        console.log("➡️ Incoming check-answer request:", { id, userAnswer, email });

        if (!id || !userAnswer) {
          console.warn("⚠️ Missing fields in request body");
          return res.status(400).send({ message: "id and userAnswer required" });
        }

        // validate ObjectId
        if (!ObjectId.isValid(id)) {
          console.warn("⚠️ Invalid question ID:", id);
          return res.status(400).send({ message: "Invalid question ID" });
        }

        const question = await questionsCol.findOne({ _id: new ObjectId(id) });
        if (!question) {
          console.warn("⚠️ Question not found for ID:", id);
          return res.status(404).send({ message: "Question not found" });
        }

        console.log("✅ Found question:", {
          type: question.type,
          question: question.question,
          answer: question.answer,
        });

        let isCorrect = false;
        let feedback = "";

        // Utility function to normalize text
        const normalize = (str) =>
          str?.toString().trim().replace(/\s+/g, " ").toLowerCase();

        // ✅ MCQ or True/False → direct string check
        // if (question.type === "mcq" || question.type === "tf") {
        //   console.log("📝 Checking MCQ/TF...");
        //   isCorrect = normalize(userAnswer) === normalize(question.answer);
        //   console.log("👉 User:", normalize(userAnswer), "| Correct:", normalize(question.answer), "| Match:", isCorrect);
        // }
        //         // ✅ MCQ or True/False → map key to value if TF
        // if (question.type === "mcq") {
        //   console.log("📝 Checking MCQ...");
        //   // For MCQ, question.answer should also be key ('A','B', etc.)
        //   isCorrect = normalize(userAnswer) === normalize(question.answer);
        //   console.log("👉 User:", normalize(userAnswer), "| Correct:", normalize(question.answer), "| Match:", isCorrect);
        // }

        // if (question.type === "tf") {
        //   console.log("📝 Checking True/False...");
        //   // Map userAnswer key to actual TF value
        //   // Assume options array is ['True', 'False'], key 'A' → True, 'B' → False
        //   const index = userAnswer.toUpperCase().charCodeAt(0) - 65; // 'A' -> 0
        //   const selectedValue = question.options[index]; // e.g., 'True' or 'False'
        //   isCorrect = normalize(selectedValue) === normalize(question.answer);
        //   console.log("👉 User TF:", selectedValue, "| Correct:", question.answer, "| Match:", isCorrect);
        // }

        if (question.type === "mcq") {
          console.log("📝 Checking MCQ...");

          // Validate userAnswer key exists in options
          const index = userAnswer.toUpperCase().charCodeAt(0) - 65;
          if (!question.options || !question.options[index]) {
            return res.status(400).send({ message: "Invalid MCQ option selected" });
          }

          isCorrect = normalize(userAnswer) === normalize(question.answer);
          feedback = isCorrect ? "Correct!" : "Incorrect!";
          console.log("👉 User:", userAnswer, "| Correct:", question.answer, "| Match:", isCorrect);
        }

        if (question.type === "tf") {
          console.log("📝 Checking True/False...");

          // Validate options
          if (!question.options || question.options.length < 2) {
            return res.status(400).send({ message: "TF question options missing" });
          }

          const index = userAnswer.toUpperCase().charCodeAt(0) - 65;
          if (index < 0 || index >= question.options.length) {
            return res.status(400).send({ message: "Invalid TF option selected" });
          }

          const selectedValue = question.options[index];
          isCorrect = normalize(selectedValue) === normalize(question.answer);
          feedback = isCorrect ? "Correct!" : "Incorrect!";
          console.log("👉 User TF:", selectedValue, "| Correct:", question.answer, "| Match:", isCorrect);
        }



        // ✅ Short Answer → AI-assisted evaluation
        if (question.type === "short") {
          console.log("🤖 Checking Short Answer with AI...");
          try {
            const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `
    Evaluate if this user answer is correct for the question.
    Question: "${question.question}"
    Correct answer: "${question.answer}"
    User answer: "${userAnswer}"
    Respond only with JSON: {"isCorrect": true/false, "feedback": "brief explanation"}
    No markdown or extra text.`;

            console.log("📤 Sending prompt to AI:", prompt);

            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();

            console.log("📥 Raw AI response:", responseText);

            // Remove potential code block wrappers
            responseText = responseText.replace(/^```json\n?|```$/g, "").trim();

            const evaluation = JSON.parse(responseText);
            isCorrect = evaluation.isCorrect;
            feedback = evaluation.feedback || "";

            console.log("✅ Parsed AI evaluation:", { isCorrect, feedback });
          } catch (err) {
            console.error("❌ AI evaluation failed:", err);
            return res.status(500).send({ message: "AI evaluation failed" });
          }
        }

        // ✅ Update stats collection
        const update = {
          $inc: {
            totalAnswered: 1,
            correct: isCorrect ? 1 : 0,
            incorrect: !isCorrect ? 1 : 0,
          },
          $setOnInsert: { email },
        };

        console.log("📊 Updating stats:", update);

        await statsCol.updateOne({ email }, update, { upsert: true });

        // ✅ Final response
        const response = {
          isCorrect,
          feedback,
          correctAnswer: question.answer,
        };

        console.log("✅ Sending final response:", response);

        res.send(response);
      } catch (err) {
        console.error("❌ check-answer error:", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });





    // Fetch stats
    app.get("/stats/:email", verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const stats = await statsCol.findOne({ email });
        res.send(
          stats || { email, totalAnswered: 0, correct: 0, incorrect: 0 }
        );
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch stats" });
      }
    });


    // -----------------------
    // CLASSES (CRUD)
    // -----------------------
    // Create class
    app.post('/classes', verifyToken, async (req, res) => {
      try {
        const payload = req.body;
        // basic validation
        if (!payload.email || !payload.subject || !payload.day || !payload.time) {
          return res.status(400).send({ message: 'email, subject, day, time required' });
        }
        // time format validation HH:mm (24h)
        const timeRegex = /^(?:[01]?\d|2[0-3]):[0-5]\d$/;
        if (!timeRegex.test(payload.time)) {
          return res.status(400).send({ message: 'time must be in HH:mm format (24h)' });
        }
        payload.createdAt = Date.now();
        const result = await classesCol.insertOne(payload);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to add class' });
      }
    });

    // Get classes for a user
    app.get('/classes/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const items = await classesCol.find({ email }).sort({ day: 1 }).toArray();
        res.send(items);
      } catch (err) {
        res.status(500).send({ message: 'Failed to fetch classes' });
      }
    });

    //update class
    app.put('/classes/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const payload = req.body;

        // console.log('update class id:--->', id);
        // console.log('class payload:--->', payload);

        // Validate ObjectId
        if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid ID' });

        // Remove _id from payload if exists
        if (payload._id) delete payload._id;

        // Update only by _id to test
        const result = await classesCol.updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...payload, updatedAt: Date.now() } }
        );

        // console.log('update class result:--->', result);

        if (result.matchedCount === 0)
          return res.status(404).send({ message: 'Class not found' });

        res.send({ success: true, message: 'Class updated successfully' });
      } catch (error) {
        console.error('Update class error:', error);
        res.status(500).send({ message: 'Server error', error });
      }
    });

    // Delete class
    app.delete('/classes/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const result = await classesCol.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: 'Failed to delete class' });
      }
    });

    // -----------------------
    // BUDGET (CRUD read + create)
    // -----------------------
    app.post('/budgets', verifyToken, async (req, res) => {
      try {
        const payload = req.body; // { email, type: 'income'|'expense', label, amount }
        const amount = Number(payload.amount);
        if (!payload.email || !payload.type || !payload.label || isNaN(amount) || amount <= 0) {
          return res.status(400).send({ message: 'email,type,label,positive amount required' });
        }
        payload.amount = amount;
        payload.createdAt = Date.now();
        const result = await budgetsCol.insertOne(payload);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: 'Failed to add budget item' });
      }
    });

    app.get('/budgets/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const items = await budgetsCol.find({ email }).sort({ createdAt: -1 }).toArray();
        res.send(items);
      } catch (err) {
        res.status(500).send({ message: 'Failed to fetch budgets' });
      }
    });
    // Update budget item
    app.put('/budgets/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'Invalid ID format' });
        }

        const payload = req.body;
        const amount = Number(payload.amount);

        if (!payload.type || !payload.label || isNaN(amount) || amount <= 0) {
          return res.status(400).send({ message: 'type,label,positive amount required' });
        }

        const result = await budgetsCol.updateOne(
          { _id: new ObjectId(id), email: payload.email }, // also check email match
          { $set: { type: payload.type, label: payload.label, amount, updatedAt: Date.now() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'Budget item not found' });
        }

        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to update budget item' });
      }
    });


    //delete budget item
    app.delete('/budgets/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const result = await budgetsCol.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: 'Failed to delete budget item' });
      }
    });

    // -----------------------
    // PLANNERS (Study tasks)
    // -----------------------
    app.post('/planners', verifyToken, async (req, res) => {
      try {
        const payload = req.body; // { email, subject, topic, priority, deadline, slot }
        if (!payload.email || !payload.subject || !payload.topic) {
          return res.status(400).send({ message: 'email,subject,topic required' });
        }
        payload.createdAt = Date.now();
        payload.done = false;
        const result = await plannersCol.insertOne(payload);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: 'Failed to add planner task' });
      }
    });

    app.get('/planners/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const items = await plannersCol.find({ email }).sort({ createdAt: -1 }).toArray();
        res.send(items);
      } catch (err) {
        res.status(500).send({ message: 'Failed to fetch planner tasks' });
      }
    });

    // PATCH: mark done/undo (simple)
    app.patch('/planners/toggle/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        // flip done
        const cur = await plannersCol.findOne({ _id: new ObjectId(id) });
        if (!cur) return res.status(404).send({ message: 'Task not found' });
        const result = await plannersCol.updateOne({ _id: new ObjectId(id) }, { $set: { done: !cur.done } });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: 'Failed to update task' });
      }
    });

    // delete study plan task
    app.delete('/planners/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;

        // if id is invalid, ObjectId() will throw
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'Invalid ID format' });
        }

        const result = await plannersCol.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: 'Task not found' });
        }

        res.send({ success: true, deletedCount: result.deletedCount });
      } catch (err) {
        res.status(500).send({ message: 'Failed to delete planner task' });
      }
    });

    // -----------------------
    // PROGRESS (Weekly report) -- unique features
    // -----------------------
    app.get('/progress/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;

        // count classes per day
        const pipeline = [
          { $match: { email } },
          { $group: { _id: "$day", total: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ];

        const result = await classesCol.aggregate(pipeline).toArray();

        // normalize all 7 days
        const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const mapped = days.map(d => {
          const found = result.find(r => r._id === d);
          return { day: d, total: found ? found.total : 0 };
        });

        res.send(mapped);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to fetch progress' });
      }
    });



    // -----------------------
    // Root test route
    // -----------------------
    app.get('/', (req, res) => {
      res.send('Student Life Toolkit Backend ✅');
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // NOTE: do NOT close client here, keep connection for lifetime
  } catch (err) {
    console.error('Fatal error', err);
    process.exit(1);
  }
}

run().catch(console.dir);
