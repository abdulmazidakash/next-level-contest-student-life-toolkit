
export default function Loader(){
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loader mb-2 animate-spin text-lg">⏳</div>
        <div className="text-lg opacity-70">Loading...</div>
      </div>
    </div>
  );
}

