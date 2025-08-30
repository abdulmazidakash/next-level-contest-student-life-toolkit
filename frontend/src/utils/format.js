
export const formatDate = (ts) => {
  try{ return new Date(ts).toLocaleString(); }catch(e){ return '' }
}

