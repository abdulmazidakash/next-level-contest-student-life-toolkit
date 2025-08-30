const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j0hxo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

// JWT Middleware
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).send({ message: 'Unauthorized access' });

  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: 'Unauthorized access' });
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    const db = client.db('student-life-toolkit');
    const usersCollection = db.collection('users');
    const classesCollection = db.collection('classes');
    const budgetsCollection = db.collection('budgets');
    const plannersCollection = db.collection('planners');
    const questionsCollection = db.collection('questions');

    // JWT Generate
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    });

    // ✅ Users API
    app.post('/users/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const isExist = await usersCollection.findOne({ email });
      if (isExist) return res.send(isExist);

      const result = await usersCollection.insertOne({ ...user, role: 'student', createdAt: Date.now() });
      res.send(result);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      res.send(user);
    });

    // ✅ Class Schedule API
    app.post('/classes', verifyToken, async (req, res) => {
      const result = await classesCollection.insertOne(req.body);
      res.send(result);
    });

    app.get('/classes/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await classesCollection.find({ email }).toArray();
      res.send(result);
    });

    app.delete('/classes/:id', verifyToken, async (req, res) => {
      const result = await classesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    // ✅ Budget Tracker API
    app.post('/budgets', verifyToken, async (req, res) => {
      const result = await budgetsCollection.insertOne(req.body);
      res.send(result);
    });

    app.get('/budgets/:email', verifyToken, async (req, res) => {
      const result = await budgetsCollection.find({ email: req.params.email }).toArray();
      res.send(result);
    });

    // ✅ Study Planner API
    app.post('/planners', verifyToken, async (req, res) => {
      const result = await plannersCollection.insertOne(req.body);
      res.send(result);
    });

    app.get('/planners/:email', verifyToken, async (req, res) => {
      const result = await plannersCollection.find({ email: req.params.email }).toArray();
      res.send(result);
    });

    // ✅ Exam Q&A Generator API (simple random MCQ)
    app.get('/questions/random', async (req, res) => {
      const count = await questionsCollection.countDocuments();
      const random = Math.floor(Math.random() * count);
      const question = await questionsCollection.find().skip(random).limit(1).toArray();
      res.send(question[0]);
    });

    // Root API
    app.get('/', (req, res) => {
      res.send('Student Life Toolkit Backend Running ✅');
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
