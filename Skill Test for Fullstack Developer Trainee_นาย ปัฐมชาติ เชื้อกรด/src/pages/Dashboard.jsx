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
  BarElement,
  Filler,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import { s, theme } from "../ui";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

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
  const [cats, setCats] = useState({});
  const [viewMode, setViewMode] = useState("month"); // month | year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCat, setSelectedCat] = useState(null);

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

  // ----------------------- Filtering -----------------------
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const filtered = useMemo(() => {
    return expenses.filter((x) => {
      const d = x.date?.toDate ? x.date.toDate() : new Date(x.date);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (viewMode === "month") {
        return `${y}-${String(m).padStart(2, "0")}` === currentYM;
      } else {
        return y === selectedYear;
      }
    });
  }, [expenses, viewMode, selectedYear]);

  const filteredByCat = selectedCat
    ? filtered.filter((e) => e.categoryId === selectedCat)
    : filtered;

  // ----------------------- Aggregations -----------------------
  const byCat = {};
  const byDay = {};
  const byMonth = {};
  filteredByCat.forEach((x) => {
    const d = x.date?.toDate ? x.date.toDate() : new Date(x.date);
    const day = d.toISOString().slice(0, 10);
    const month = d.getMonth();
    byCat[x.categoryId] = (byCat[x.categoryId] || 0) + Number(x.amount || 0);
    byDay[day] = (byDay[day] || 0) + Number(x.amount || 0);
    byMonth[month] = (byMonth[month] || 0) + Number(x.amount || 0);
  });

  const total = filteredByCat.reduce((s, x) => s + Number(x.amount || 0), 0);
  const top5 = [...filteredByCat].sort((a, b) => b.amount - a.amount).slice(0, 5);

  // ----------------------- Chart Data -----------------------
  const catIds = Object.keys(byCat);
  const pieData = {
    labels: catIds.map((cid) => cats[cid]?.name || cid),
    datasets: [
      {
        data: catIds.map((cid) => byCat[cid]),
        backgroundColor: catIds.map((cid) => hexToRgba(cats[cid]?.color || "#4da1ff", 0.85)),
        borderColor: catIds.map((cid) => cats[cid]?.color || theme.accent1),
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
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedCat = catIds[index];
        setSelectedCat((prev) => (prev === clickedCat ? null : clickedCat));
      }
    },
  };

  const lineLabels = Object.keys(byDay).sort();
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Daily Spend",
        data: lineLabels.map((k) => byDay[k]),
        borderColor: theme.accent1,
        backgroundColor: hexToRgba(theme.accent1, 0.25),
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const barData = {
    labels: Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "short" })
    ),
    datasets: [
      {
        label: "Monthly Total",
        data: Array.from({ length: 12 }, (_, i) => byMonth[i] || 0),
        backgroundColor: hexToRgba(theme.accent2, 0.8),
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { labels: { color: theme.text } },
      tooltip: { titleColor: theme.text, bodyColor: theme.text },
    },
    scales: {
      x: { ticks: { color: theme.muted }, grid: { color: theme.border } },
      y: { ticks: { color: theme.muted }, grid: { color: theme.border } },
    },
  };

  // ----------------------- Render -----------------------
  return (
    <div>
      <h2 style={{ margin: "8px 0 16px" }}>
        Dashboard — {viewMode === "month" ? currentYM : selectedYear}
      </h2>

      <div style={{ ...s.card, marginBottom: 12 }}>
        <div style={s.row}>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={s.select}
          >
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          {viewMode === "year" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={s.select}
            >
              {[...new Set(expenses.map((e) => {
                const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
                return d.getFullYear();
              }))]
                .sort((a, b) => b - a)
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          )}
          {selectedCat && (
            <button
              onClick={() => setSelectedCat(null)}
              style={{
                background: "transparent",
                border: `1px solid ${theme.accent1}`,
                borderRadius: 12,
                color: theme.text,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Clear Filter ({cats[selectedCat]?.name || "?"})
            </button>
          )}
        </div>
      </div>

      <div style={s.grid3}>
        <div style={{ ...s.card, ...s.kpi }}>
          <div style={s.kpiTitle}>Total</div>
          <div style={s.kpiValue}>{total.toLocaleString()}</div>
        </div>
        <div style={{ ...s.card, ...s.kpi }}>
          <div style={s.kpiTitle}>Records</div>
          <div style={s.kpiValue}>{filteredByCat.length}</div>
        </div>
        <div style={{ ...s.card, ...s.kpi }}>
          <div style={s.kpiTitle}>Top Expense</div>
          <div style={s.kpiValue}>{(top5[0]?.amount || 0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ ...s.grid2, marginTop: 16 }}>
        <div style={s.card}>
          <h3 style={{ marginTop: 0 }}>By Category (Pie)</h3>
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div style={s.card}>
          <h3 style={{ marginTop: 0 }}>
            {viewMode === "month" ? "Daily Trend (Line)" : "Yearly Summary (Bar)"}
          </h3>
          {viewMode === "month" ? (
            <Line data={lineData} options={chartOptions} />
          ) : (
            <Bar data={barData} options={chartOptions} />
          )}
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
