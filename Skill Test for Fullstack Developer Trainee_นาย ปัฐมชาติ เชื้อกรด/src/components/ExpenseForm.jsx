import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { s } from "../ui";

export default function ExpenseForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState("");
  const [cats, setCats] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "categories"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCats(list);
      if (!categoryId && list[0]) setCategoryId(list[0].id);
    });
  }, [user.uid]);

  const add = async (e) => {
    e.preventDefault();
    if (!amount) return;
    await addDoc(collection(db, "users", user.uid, "expenses"), {
      amount: Number(amount),
      categoryId,
      date: new Date(date),
      note,
      createdAt: new Date(),
    });
    setAmount("");
    setNote("");
  };

  return (
    <form onSubmit={add} style={{ ...s.card, marginBottom: 16 }}>
      <div style={s.row}>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={s.input}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={s.select}
        >
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={s.input}
        />
        <input
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ ...s.input, minWidth: 220 }}
        />
        <button type="submit" style={s.btn}>
          Add
        </button>
      </div>
      <div style={s.helper}>เพิ่มรายการค่าใช้จ่ายของคุณ</div>
    </form>
  );
}
