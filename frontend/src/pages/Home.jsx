
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="grid lg:grid-cols-2 gap-6 items-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">Make your student life simpler ✨</h1>
        <p className="mb-6">Track classes, plan studies, manage budget, generate exam questions and stay focused.</p>
        <div className="flex gap-3">
          <Link to="/dashboard" className="btn btn-primary">Open Dashboard</Link>
          <Link to="/focus" className="btn btn-accent">Try Focus Mode</Link>
        </div>
      </div>
      <img className="rounded-2xl shadow" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" alt="hero"/>
    </div>
  )
}

