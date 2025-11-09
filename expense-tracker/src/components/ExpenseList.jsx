import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { s } from "../ui";

export default function ExpenseList({ range, categoryId, sortBy }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState({}); // id -> {name,color}

  useEffect(() => {
    const q1 = query(
      collection(db, "users", user.uid, "expenses"),
      orderBy("date", "desc")
    );
    const unsub1 = onSnapshot(q1, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const q2 = query(
      collection(db, "users", user.uid, "categories"),
      orderBy("createdAt", "asc")
    );
    const unsub2 = onSnapshot(q2, (snap) => {
      const m = {};
      snap.docs.forEach((d) => (m[d.id] = { id: d.id, ...d.data() }));
      setCats(m);
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [user.uid]);

  const filtered = useMemo(() => {
    const from = range?.from ? new Date(range.from) : null;
    const to = range?.to ? new Date(range.to + "T23:59:59") : null;
    let arr = items.filter((x) => {
      const okCat = categoryId ? x.categoryId === categoryId : true;
      const t = x.date?.toDate ? x.date.toDate() : new Date(x.date);
      const okFrom = from ? t >= from : true;
      const okTo = to ? t <= to : true;
      return okCat && okFrom && okTo;
    });

    if (sortBy === "amount_desc") arr.sort((a, b) => b.amount - a.amount);
    else if (sortBy === "amount_asc") arr.sort((a, b) => a.amount - b.amount);
    else if (sortBy === "date_asc")
      arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    else arr.sort((a, b) => new Date(b.date) - new Date(a.date));

    return arr;
  }, [items, range, categoryId, sortBy]);

  const remove = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "expenses", id));
  };

  return (
    <div style={s.card}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={s.th}>Date</th>
            <th style={s.th}>Category</th>
            <th style={{ ...s.th, textAlign: "right" }}>Amount</th>
            <th style={s.th}>Note</th>
            <th style={{ ...s.th, width: 120 }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => {
            const cat = cats[e.categoryId];
            const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
            return (
              <tr key={e.id}>
                <td style={s.td}>{d.toISOString().slice(0, 10)}</td>
                <td style={s.td}>
                  <span style={s.badge}>
                    <span style={s.dot(cat?.color)} />
                    {cat?.name || "-"}
                  </span>
                </td>
                <td style={{ ...s.td, textAlign: "right" }}>
                  {e.amount.toLocaleString()}
                </td>
                <td style={s.td}>{e.note}</td>
                <td style={{ ...s.td, textAlign: "right" }}>
                  <button style={s.btnDanger} onClick={() => remove(e.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
