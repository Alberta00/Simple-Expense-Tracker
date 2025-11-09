import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";

export default function Categories() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users", user.uid, "categories"), orderBy("createdAt", "asc"));
    return onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user.uid]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addDoc(collection(db, "users", user.uid, "categories"), {
      name, color, createdAt: new Date()
    });
    setName("");
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "categories", id));
  };

  return (
    <div>
      <h2>Categories</h2>
      <form onSubmit={add} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="Category name" value={name} onChange={e=>setName(e.target.value)} />
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <ul style={{ display: "grid", gap: 6 }}>
        {items.map(c => (
          <li key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 14, background: c.color, display: "inline-block", borderRadius: 3 }} />
            <span>{c.name}</span>
            <button onClick={() => remove(c.id)} style={{ marginLeft: "auto" }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
