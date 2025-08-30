
export default function ClassCard({ item, onDelete }){
  return (
    <div className="p-4 rounded-xl shadow" style={{ background: item.color ? item.color + '20' : '#f3f4f6' }}>
      <div className="flex justify-between">
        <div>
          <div className="font-semibold">{item.subject}</div>
          <div className="text-sm opacity-80">{item.day} • {item.time}</div>
          <div className="text-sm">{item.instructor}</div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn btn-xs btn-error" onClick={() => onDelete(item._id)}>Delete</button>
        </div>
      </div>
    </div>
  )
}

