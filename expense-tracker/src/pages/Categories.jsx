import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { s } from "../ui";

export default function Categories() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "categories"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user.uid]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addDoc(collection(db, "users", user.uid, "categories"), {
      name,
      color,
      createdAt: new Date(),
    });
    setName("");
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "categories", id));
  };

  return (
    <div>
      <div style={{ ...s.card, marginBottom: 12 }}>
        <h2 style={{ margin: "4px 0 12px" }}>Categories</h2>
        <form onSubmit={add} style={s.row}>
          <input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={s.input}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ ...s.input, padding: 6, minWidth: 60 }}
          />
          <button type="submit" style={s.btn}>
            Add
          </button>
        </form>
        <div style={s.helper}>จัดการหมวดหมู่สำหรับรายจ่ายของคุณ</div>
      </div>

      <div style={s.card}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {items.map((c) => (
            <span key={c.id} style={s.badge}>
              <span style={s.dot(c.color)} />
              {c.name}
              <button
                style={{ ...s.btnSecondary, marginLeft: 8 }}
                onClick={() => remove(c.id)}
              >
                Delete
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
