// src/ui.js
export const theme = {
  bg: "#0a1228",           // พื้นหลังหลัก (Deep Azure Abyss)
  panel: "#101b33",        // พื้นหลังการ์ด
  text: "#e6ebf5",         // ตัวอักษรหลัก
  muted: "#9aa8c2",        // ตัวอักษรรอง
  border: "#1f2b45",       // เส้นขอบ
  accent1: "#4da1ff",      // สีหลักฟ้าอ่อน
  accent2: "#6de0ff",      // สีเน้นรอง
  danger1: "#ff7c7c",
  danger2: "#ff4d4d",
};

export const s = {
  // layout
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: 24,
    color: theme.text,
    minHeight: "100vh",
    background: `radial-gradient(1200px 800px at 10% 0%, #0d1734 0%, ${theme.bg} 55%, #071022 100%)`,
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue", sans-serif',
  },

  // navbar + links + buttons (ที่ App.jsx ใช้)
  nav: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
    background: "rgba(255,255,255,.04)",
    backdropFilter: "blur(6px)",
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    padding: "10px 12px",
  },
  link: (active) => ({
    color: active ? "#fff" : theme.muted,
    textDecoration: "none",
    fontWeight: 600,
    padding: "8px 12px",
    borderRadius: 10,
    background: active ? "rgba(77,161,255,.15)" : "transparent",
  }),
  spacer: { flex: 1 },
  btn: {
    background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent2})`,
    color: "#061227",
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnSecondary: {
    background: "transparent",
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  btnDanger: {
    background: `linear-gradient(135deg, ${theme.danger1}, ${theme.danger2})`,
    color: "#1b0b0b",
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  // cards / form inputs / grids
  card: {
    background: theme.panel,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 24px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.04)",
  },
  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  input: {
    background: "#0b1428",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    padding: "10px 12px",
    borderRadius: 12,
    outline: "none",
    minWidth: 140,
  },
  select: {
    background: "#0b1428",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    padding: "10px 12px",
    borderRadius: 12,
    outline: "none",
    minWidth: 160,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },

  // kpi / text helper
  kpi: { display: "flex", flexDirection: "column", gap: 6 },
  kpiTitle: { color: theme.muted, fontSize: 13 },
  kpiValue: { fontSize: 28, fontWeight: 800, letterSpacing: ".2px" },
  helper: { color: theme.muted, fontSize: 13, marginTop: 8 },

  // table + badges (ที่ ExpenseList ใช้)
  th: {
    textAlign: "left",
    color: theme.muted,
    fontWeight: 700,
    background: "#0f1f3b",
    padding: "12px 10px",
    borderBottom: `1px solid ${theme.border}`,
  },
  td: { padding: "12px 10px", borderBottom: `1px solid ${theme.border}` },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 8px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: "rgba(255,255,255,.04)",
    fontWeight: 600,
  },
  dot: (color) => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: color || "#64748b",
  }),
};
