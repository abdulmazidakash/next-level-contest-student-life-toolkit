
import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

export default function ExamQA(){
  const [q, setQ] = useState(null);
  const [answer, setAnswer] = useState("");

  const load = async ()=>{
    try{
      const { data } = await api.get('/questions/random');
      console.log('exam q a section --->', data);
      setQ(data);
      setAnswer("");
    }catch(err){ Swal.fire("Error", err.message, "error"); }
  }
  useEffect(()=>{ load(); },[]);

  if(!q) return <div>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card bg-base-100 shadow p-6">
        <div className="font-semibold mb-2">{q.question}</div>
        {q.type === 'mcq' && (
          <div className="grid gap-2">
            {q.options?.map((op,i)=> (
              <label key={i} className="label cursor-pointer justify-start gap-2">
                <input type="radio" name="ans" className="radio" onChange={()=>setAnswer(op)} />
                <span>{op}</span>
              </label>
            ))}
          </div>
        )}
        {q.type !== 'mcq' && (
          <textarea className="textarea textarea-bordered w-full" placeholder="Write your short answer" value={answer} onChange={(e)=>setAnswer(e.target.value)} />
        )}
        <div className="mt-4 flex gap-3">
          <button className="btn btn-primary" onClick={()=> Swal.fire("Your Answer", answer || "(empty)", "info")}>Submit</button>
          <button className="btn" onClick={load}>Next Question</button>
        </div>
      </div>
    </div>
  )
}

