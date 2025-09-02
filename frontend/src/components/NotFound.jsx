
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-[#03A9F4]">404</h1>
      <p className="mt-4 text-xl text-[#03A9F4]">Page not found</p>
      <Link to="/" className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC] mt-6">Go Home</Link>
    <p className="mt-3 font-bold text-center">
        <Link to="/" className="btn btn-ghost text-2xl text-[#03A9F4]">🎒 Student Toolkit</Link>
      </p>
    </div>
  );
}

