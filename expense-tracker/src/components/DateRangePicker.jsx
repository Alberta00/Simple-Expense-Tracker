import { useState } from "react";
import { s } from "../ui";

export default function DateRangePicker({ value, onChange }) {
  const [from, setFrom] = useState(value?.from ?? "");
  const [to, setTo] = useState(value?.to ?? "");
  const set = () => onChange?.({ from, to });

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={s.input} />
      <span style={{ color: "#94a3b8" }}>to</span>
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={s.input} />
      <button onClick={set} style={s.btn}>Apply</button>
    </div>
  );
}
