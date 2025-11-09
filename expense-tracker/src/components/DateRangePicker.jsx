import { useState } from "react";
import { format } from "date-fns";

export default function DateRangePicker({ value, onChange }) {
  const [from, setFrom] = useState(value?.from ?? "");
  const [to, setTo] = useState(value?.to ?? "");
  const set = () => onChange?.({ from, to });

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
      <span>to</span>
      <input type="date" value={to} onChange={e=>setTo(e.target.value)} />
      <button onClick={set}>Apply</button>
    </div>
  );
}
