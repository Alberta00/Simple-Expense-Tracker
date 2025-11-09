import { useEffect, useState } from "react";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import DateRangePicker from "../components/DateRangePicker";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";

export default function Expenses() {
  const { user } = useAuth();
  const [range, setRange] = useState({});
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [cats, setCats] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users", user.uid, "categories"), orderBy("createdAt", "asc"));
    return onSnapshot(q, snap => setCats(snap.docs.map(d => ({ id:d.id, ...d.data() }))));
  }, [user.uid]);

  return (
    <div>
      <h2>Expenses</h2>
      <ExpenseForm />
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom: 12 }}>
        <DateRangePicker value={range} onChange={setRange} />
        <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="date_desc">Sort: Date ↓</option>
          <option value="date_asc">Sort: Date ↑</option>
          <option value="amount_desc">Sort: Amount ↓</option>
          <option value="amount_asc">Sort: Amount ↑</option>
        </select>
      </div>

      <ExpenseList range={range} categoryId={categoryId} sortBy={sortBy} />
    </div>
  );
}
