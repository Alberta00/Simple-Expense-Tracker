import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { s, theme } from "../ui";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState("login");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        await createUserWithEmailAndPassword(auth, email, pw);
      }
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ ...s.card, maxWidth: 420, margin: "48px auto" }}>
      <h2 style={{ marginTop: 0 }}>{mode === "login" ? "Login" : "Register"}</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={s.input}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={s.input}
          required
        />
        {err && (
          <div style={{ color: theme.danger1, fontSize: 14 }}>{err}</div>
        )}
        <button type="submit" style={s.btn}>
          {mode === "login" ? "Login" : "Create account"}
        </button>
      </form>

      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={s.btnSecondary}
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
}
