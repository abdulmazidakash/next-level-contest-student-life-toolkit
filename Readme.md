
# 📝 Student Life Toolkit

**A React web application designed to make student life easier, more organized, and productive.**  

This application helps students manage their **class schedules, budget, study plans, and exam preparation** — all in one platform. The app also includes a **unique generative AI Exam Q&A feature**, which allows students to practice personalized questions based on difficulty and subject.

---

## 🚀 Features

### 1. Class Schedule Tracker
- Add, edit, and delete classes with details like:
  - **Subject**
  - **Time & Day**
  - **Instructor**
- Color-coded subjects for easy visualization.
- Weekly or daily view of your schedule.
- Notifications/reminders for upcoming classes.  

---

### 2. Budget Tracker
- Add **income sources** like allowance, scholarships, or part-time jobs.
- Track **expenses** such as food, transport, books, or entertainment.
- Visual representation of your finances using **charts and graphs**.
- Track savings and set budget goals.
- Prevents negative entries and validates data for accuracy.

---

### 3. Exam Q&A Generator (Unique Feature)
- Generate **practice questions** instantly using **AI-powered algorithms**.
- Supports:
  - Multiple Choice Questions (MCQs)
  - True/False
  - Short Answer Questions
- Set **difficulty levels**: Easy, Medium, Hard.
- AI adapts questions based on your performance.
- Allows creating **custom quizzes** per subject or topic.
- Provides immediate feedback and explanations.  

---

### 4. Study Planner
- Break down big study goals into **smaller, manageable tasks**.
- Allocate **time slots and days** for each subject.
- Assign **priority level** and **deadlines** to tasks.
- Track progress with checklists and completion stats.

---

### 5. Additional Unique Features
- **AI Smart Suggestions:** Recommends study priorities and budget adjustments.
- **Dark Mode & Custom Themes:** Comfortable viewing for long study sessions.
- **Progress Reports & Analytics:** See your weekly productivity and spending trends.
- **Notifications & Reminders:** Alerts for upcoming classes, deadlines, and tasks.
- **Offline Data Support:** Some features work offline, syncing automatically.
- **Export Data:** Export class schedules, budgets, or study plans to PDF/CSV.

---

## 🖥️ Tech Stack

**Frontend**
- React.js
- Tailwind CSS & DaisyUI
- React Router v7
- Recharts
- Axios

**Backend**
- Node.js with Express.js
- MongoDB
- JWT Authentication
- RESTful APIs

**AI Features**
- OpenAI / Generative AI API for exam question generation

---

## 🔧 Features Implementation

- **State Management:** React Context API for global state management.
- **Data Validation:** Form validation to prevent negative or invalid entries.
- **Error Handling:** User-friendly error messages for invalid inputs.
- **Responsive Design:** Fully responsive across mobile, tablet, and desktop.

---

## 📂 Project Structure

```

student-life-toolkit/
│
├─ backend/
│   ├─ models/
│   ├─ routes/
│   ├─ controllers/
│   └─ server.js
│
├─ frontend/
│   ├─ src/
│   │   ├─ components/
│   │   ├─ pages/
│   │   ├─ context/
│   │   ├─ utils/
│   │   └─ App.js
│
├─ README.md
├─ package.json
└─ .env.example

````

---

## 📌 Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/student-life-toolkit.git
cd student-life-toolkit
````

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

4. Setup Environment Variables

```env
PORT=5000
DB_USER=your_database_user
DB_PASS=your_database_pass
ACCESS_TOKEN_SECRET=your_jwt_secret
GEMINI_API_KEY=your_openai_key
```

5. Run the Application

```bash
# Backend
cd backend
npm run dev

# Frontend
cd ../frontend
npm start
```

---

## 📷 Screenshots

![Student Toolkit](/screencapture-student-life-toolkit.png)

---

## 🌐 Deployment

* **Backend:** [Vercel Link](https://student-toolkit-backend.vercel.app)
* **Frontend:** [Firebase Link](https://student-life-toolkit-4462d.web.app)
* **Frontend:** [Netlify Link](https://student-toolkit-akash.netlify.app)

---

## 🎥 Presentation Video

* [Watch Here](https://drive.google.com/file/d/your-file-id/view?usp=sharing) – 5–10 minutes explanation of features and walkthrough.

---

## 💡 Future Enhancements

* Add **calendar sync** with Google Calendar.
* Integrate **push notifications** for tasks and exams.
* AI suggestions for **budget optimization**.
* Gamified rewards for completing study goals.

---

## 📄 License

MIT License – Free to use and modify for personal or academic purposes.

---

## 🔑 Unique Selling Point

**The Generative AI Exam Q\&A Generator** is the standout feature of this application.
It allows students to **practice tailored questions dynamically**, making exam preparation smarter, faster, and more efficient than traditional methods.


