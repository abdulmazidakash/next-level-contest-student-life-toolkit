
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const DEFAULTS = { focus: 25, short: 5, long: 15 };

export default function FocusTimer(){
  const [minutes, setMinutes] = useState(() => Number(localStorage.getItem('slt_focus_m')) || DEFAULTS.focus);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('focus');
  const [blockList, setBlockList] = useState(()=> JSON.parse(localStorage.getItem('slt_block')||'[]'));
  const timer = useRef(null);

  useEffect(()=>{ localStorage.setItem('slt_block', JSON.stringify(blockList)); },[blockList]);

  const start = ()=>{
    if(running) return; setRunning(true);
    timer.current = setInterval(()=>{
      setSeconds(s=>{
        if(s>0) return s-1;
        return 59;
      });
      setMinutes(m=>{
        if(seconds>0) return m;
        if(m>0) return m-1;
        clearInterval(timer.current); setRunning(false);
        Swal.fire("Time's up!", `Session finished: ${mode}`, "success");
        return mode==='focus'? DEFAULTS.short : DEFAULTS.focus;
      })
    },1000);
  }
  const stop = ()=>{ clearInterval(timer.current); setRunning(false); }
  const reset = ()=>{ stop(); setMinutes(DEFAULTS[mode]); setSeconds(0); }

  const switchMode = (m)=>{ setMode(m); stop(); setMinutes(DEFAULTS[m]); setSeconds(0); }

  const addBlock = ()=>{
    Swal.fire({
      title: 'Add site to blocklist',
      input: 'text',
      inputLabel: 'example: youtube.com',
      showCancelButton: true
    }).then(res=>{
      if(res.isConfirmed && res.value){
        setBlockList(prev=> Array.from(new Set([...prev, res.value.replace(/^https?:\/\//,'')])));
      }
    })
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="card bg-base-100 shadow p-6 text-center">
        <div className="join mb-4">
          <button className={`btn join-item ${mode==='focus'?'btn-primary':''}`} onClick={()=>switchMode('focus')}>Focus</button>
          <button className={`btn join-item ${mode==='short'?'btn-primary':''}`} onClick={()=>switchMode('short')}>Short</button>
          <button className={`btn join-item ${mode==='long'?'btn-primary':''}`} onClick={()=>switchMode('long')}>Long</button>
        </div>
        <div className="text-6xl font-bold tabular-nums">
          {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
        </div>
        <div className="mt-4 flex justify-center gap-3">
          {!running ? <button className="btn btn-primary" onClick={start}>Start</button> : <button className="btn btn-warning" onClick={stop}>Pause</button>}
          <button className="btn" onClick={reset}>Reset</button>
        </div>
      </div>

      <div className="card bg-base-100 shadow p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Blocklist (just a reminder list)</h3>
          <button className="btn btn-sm" onClick={addBlock}>Add</button>
        </div>
        <ul className="list-disc ml-6 space-y-1">
          {blockList.map((s,i)=> (
            <li key={i} className="flex justify-between items-center">
              <span>{s}</span>
              <button className="btn btn-xs btn-error" onClick={()=> setBlockList(prev=> prev.filter(x=>x!==s))}>Remove</button>
            </li>
          ))}
        </ul>
        {blockList.length===0 && <div className="opacity-70">No sites yet</div>}
      </div>
    </div>
  )
}

