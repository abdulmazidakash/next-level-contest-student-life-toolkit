
import { Link } from "react-router-dom";

export default function Dashboard(){
  const cards = [
    { to: "/classes", title: "Class Schedule", desc: "Never miss a lecture" },
    { to: "/budget", title: "Budget Tracker", desc: "Know where money goes" },
    { to: "/planner", title: "Study Planner", desc: "Break big goals" },
    { to: "/exam", title: "Exam Q&A", desc: "Practice makes perfect" },
    { to: "/focus", title: "Focus Mode", desc: "Pomodoro + block list" },
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((c)=> (
        <Link key={c.to} to={c.to} className="card bg-base-100 shadow hover:shadow-lg transition p-6">
          <h3 className="text-xl font-semibold">{c.title}</h3>
          <p className="text-sm opacity-80">{c.desc}</p>
        </Link>
      ))}
    </div>
  )
}

