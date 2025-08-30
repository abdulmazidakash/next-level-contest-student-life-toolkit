
export default function BudgetTable({ list = [] }){
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Type</th>
            <th>Label</th>
            <th>Amount</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {list.map(i => (
            <tr key={i._id}>
              <td><span className={`badge ${i.type === 'income' ? 'badge-success' : 'badge-error'}`}>{i.type}</span></td>
              <td>{i.label}</td>
              <td>${i.amount}</td>
              <td>{new Date(i.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

