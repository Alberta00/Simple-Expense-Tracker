import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import { s, theme } from "../ui";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

// แปลง #RRGGBB -> rgba(r,g,b,alpha)
function hexToRgba(hex, a = 1) {
  const h = hex?.replace("#", "");
  if (!h || (h.length !== 6 && h.length !== 3)) return `rgba(100,116,139,${a})`;
  const bigint =
    h.length === 3
      ? parseInt(h.split("").map((c) => c + c).join(""), 16)
      : parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [cats, setCats] = useState({}); // id -> {name, color}

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, "users", user.uid, "expenses"), orderBy("date", "desc")),
      (snap) => setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsub2 = onSnapshot(
      query(collection(db, "users", user.uid, "categories")),
      (snap) => {
        const m = {};
        snap.docs.forEach((d) => (m[d.id] = { id: d.id, ...d.data() }));
        setCats(m);
      }
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, [user.uid]);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthData = useMemo(() => {
    const filtered = expenses.filter((e) => {
      const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
      const yymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return yymm === ym;
    });
    const total = filtered.reduce((s, x) => s + Number(x.amount || 0), 0);

    const byCat = {};
    filtered.forEach((x) => {
      byCat[x.categoryId] = (byCat[x.categoryId] || 0) + Number(x.amount || 0);
    });

    const byDay = {};
    filtered.forEach((x) => {
      const d = x.date?.toDate ? x.date.toDate() : new Date(x.date);
      const key = d.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + Number(x.amount || 0);
    });

    return { filtered, total, byCat, byDay };
  }, [expenses, ym]);

  // ----- สร้างสีจากหมวดหมู่ -----
  const catIds = Object.keys(monthData.byCat);
  const pieLabels = catIds.map((cid) => cats[cid]?.name || cid);
  const pieValues = catIds.map((cid) => monthData.byCat[cid]);
  const pieColors = catIds.map((cid) => cats[cid]?.color || "#7c9eff");

  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieValues,
        backgroundColor: pieColors.map((c) => hexToRgba(c, 0.92)),
        borderColor: pieColors,
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        labels: { color: theme.text },
      },
      tooltip: {
        titleColor: theme.text,
        bodyColor: theme.text,
      },
    },
  };

  // ----- Line chart (ให้มองเห็นชัดบนพื้นมืด) -----
  const lineLabels = Object.keys(monthData.byDay).sort();
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Daily Spend",
        data: lineLabels.map((k) => monthData.byDay[k]),
        borderColor: theme.accent1,
        backgroundColor: hexToRgba(theme.accent1, 0.2),
        pointBackgroundColor: theme.accent2,
        pointRadius: 3,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    plugins: {
      legend: { labels: { color: theme.text } },
      tooltip: { titleColor: theme.text, bodyColor: theme.text },
    },
    scales: {
      x: {
        ticks: { color: theme.muted },
        grid: { color: theme.border },
      },
      y: {
        ticks: { color: theme.muted },
        grid: { color: theme.border },
      },
    },
  };

  const top5 = [...monthData.filtered].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <div>
      <h2 style={{ margin: "8px 0 16px" }}>Dashboard ({ym})</h2>

      <div style={s.grid3}>
        <div style={{ ...s.card, ...s.kpi }}>
          <div style={s.kpiTitle}>Total this month</div>
          <div style={s.kpiValue}>{monthData.total.toLocaleString()}</div>
        </div>
        <div style={{ ...s.card, ...s.kpi }}>
          <div style={s.kpiTitle}>Records</div>
          <div style={s.kpiValue}>{monthData.filtered.length}</div>
        </div>
        <div style={{ ...s.card, ...s.kpi }}>
          <div style={s.kpiTitle}>Top expense</div>
          <div style={s.kpiValue}>{(top5[0]?.amount || 0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ ...s.grid2, marginTop: 16 }}>
        <div style={s.card}>
          <h3 style={{ marginTop: 0 }}>By Category (Pie)</h3>
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div style={s.card}>
          <h3 style={{ marginTop: 0 }}>Daily Trend (Line)</h3>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      <div style={{ ...s.card, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Top 5 Expenses</h3>
        <ul style={s.helper}>
          {top5.map((x) => {
            const d = x.date?.toDate ? x.date.toDate() : new Date(x.date);
            return (
              <li key={x.id}>
                {d.toISOString().slice(0, 10)} — {cats[x.categoryId]?.name || "-"} —{" "}
                {x.amount.toLocaleString()} — {x.note}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
