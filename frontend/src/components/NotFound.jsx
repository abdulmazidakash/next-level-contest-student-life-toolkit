
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl">Page not found</p>
      <Link to="/" className="btn btn-primary mt-6">Go Home</Link>
    </div>
  );
}

