// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB connection (native driver)
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER || 'cluster0.j0hxo.mongodb.net'}/?retryWrites=true&w=majority&appName=StudentLifeToolkit`;

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
        const items = await classesCol.find({ email }).sort({ day: 1}).toArray();
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

        console.log('update id:', id);
        console.log('payload:', payload);

        // Validate ObjectId
        if (!ObjectId.isValid(id)) return res.status(400).send({message:'Invalid ID'});

        // Remove _id from payload if exists
        // if (payload._id) delete payload._id;

        // Update only by _id to test
        const result = await classesCol.updateOne(
          { _id: new ObjectId(id) }, 
          { $set: { ...payload, updatedAt: Date.now() } }
        );

        console.log('update result:', result);

        if (result.matchedCount === 0)
          return res.status(404).send({message: 'Class not found'});

        res.send({success: true, message: 'Class updated successfully'});
      } catch (error) {
        console.error('Update class error:', error);
        res.status(500).send({message: 'Server error', error});
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


    // (Optional) delete budget item
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

    // delete  task
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
    // QUESTIONS (seed + random)
    // -----------------------
    // sample question shape:
    // {
    //   type: 'mcq' | 'short' | 'tf',
    //   question: '...',
    //   options: ['a','b','c','d'] (for mcq),
    //   answer: '...'   (optional for backend; not necessary to send to frontend)
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

    // Get a random question
    app.get('/questions/random', async (req, res) => {
      try {
        const count = await questionsCol.countDocuments();
        console.log('server side response:--->', count);
        if (count === 0) return res.status(404).send({ message: 'No questions yet. Run /seed-questions' });
        const rnd = Math.floor(Math.random() * count);
        const q = await questionsCol.find().skip(rnd).limit(1).toArray();
        // Don't send answer field if you want users to solve; but front-end for practice may not need it.
        const question = q[0] || null;
        if (question) {
          // remove answer before sending to client (so they won't see correct answer)
          const { answer, ...payload } = question;
          res.send(payload);
        } else {
          res.status(404).send({ message: 'Question not found' });
        }
      } catch (err) {
        res.status(500).send({ message: 'Failed to fetch question' });
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

   // -----------------------
// PROGRESS (Weekly report)
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
    const days = ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
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
