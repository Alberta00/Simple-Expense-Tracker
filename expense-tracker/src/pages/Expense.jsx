import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { format } from "date-fns";
import ExpenseList from "../components/ExpenseList";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [cats, setCats] = useState({});

  useEffect(() => {
    const unsub1 = onSnapshot(query(collection(db, "users", user.uid, "expenses"), orderBy("date","desc")), snap => {
      setExpenses(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(query(collection(db, "users", user.uid, "categories")), snap => {
      const m={}; snap.docs.forEach(d => m[d.id] = { id:d.id, ...d.data() });
      setCats(m);
    });
    return () => {unsub1();unsub2();};
  }, [user.uid]);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

  const monthData = useMemo(() => {
    const filtered = expenses.filter(e => {
      const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
      const yymm = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      return yymm === ym;
    });
    const total = filtered.reduce((s,x)=>s + Number(x.amount||0), 0);

    // sum by category
    const byCat = {};
    filtered.forEach(x => {
      byCat[x.categoryId] = (byCat[x.categoryId] || 0) + Number(x.amount||0);
    });

    // sum by day
    const byDay = {};
    filtered.forEach(x => {
      const d = (x.date?.toDate ? x.date.toDate() : new Date(x.date));
      const key = format(d, "yyyy-MM-dd");
      byDay[key] = (byDay[key] || 0) + Number(x.amount||0);
    });

    return { filtered, total, byCat, byDay };
  }, [expenses, ym]);

  const pieData = {
    labels: Object.keys(monthData.byCat).map(cid => cats[cid]?.name || cid),
    datasets: [{
      data: Object.values(monthData.byCat),
    }],
  };

  const lineData = {
    labels: Object.keys(monthData.byDay).sort(),
    datasets: [{ label: "Daily Spend", data: Object.keys(monthData.byDay).sort().map(k=>monthData.byDay[k]) }]
  };

  const top5 = [...monthData.filtered].sort((a,b)=>b.amount-a.amount).slice(0,5);

  return (
    <div>
      <h2>Dashboard ({ym})</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
        <div style={{ padding:12, border:"1px solid #eee", borderRadius:8 }}>
          <div>Total this month</div>
          <div style={{ fontSize:28, fontWeight:700 }}>{monthData.total.toLocaleString()}</div>
        </div>
        <div style={{ padding:12, border:"1px solid #eee", borderRadius:8 }}>
          <div>Records</div>
          <div style={{ fontSize:28, fontWeight:700 }}>{monthData.filtered.length}</div>
        </div>
        <div style={{ padding:12, border:"1px solid #eee", borderRadius:8 }}>
          <div>Top expense</div>
          <div style={{ fontSize:28, fontWeight:700 }}>{(top5[0]?.amount||0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
        <div style={{ padding:12, border:"1px solid #eee", borderRadius:8 }}>
          <h3>By Category (Pie)</h3>
          <Pie data={pieData} />
        </div>
        <div style={{ padding:12, border:"1px solid #eee", borderRadius:8 }}>
          <h3>Daily Trend (Line)</h3>
          <Line data={lineData} />
        </div>
      </div>

      <div style={{ padding:12, border:"1px solid #eee", borderRadius:8, marginTop:16 }}>
        <h3>Top 5 Expenses</h3>
        <ul>
          {top5.map(x => {
            const d = x.date?.toDate ? x.date.toDate() : new Date(x.date);
            return <li key={x.id}>{d.toISOString().slice(0,10)} — {cats[x.categoryId]?.name||"-"} — {x.amount.toLocaleString()} — {x.note}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
