import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      navigate("/solicitudes");
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pagina}>
      <div style={styles.card}>

        <div style={styles.encabezado}>
          
          <h2 style={styles.titulo}>Sistema de equipamiento</h2>
          <p style={styles.subtitulo}>Ingresá con tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.campo}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="xxxxxxx@email.com"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.boton}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p style={styles.registro}>
          ¿No tenés cuenta?{" "}
          <a href="/register" style={styles.link}>Registrate</a>
        </p>

      </div>
    </div>
  );
};

const styles = {
  pagina: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111",
    padding: "24px",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "2rem 2.5rem",
    width: "100%",
    maxWidth: "380px",
  },
  encabezado: {
    textAlign: "center",
    marginBottom: "1.8rem",
  },
  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#1e3a5f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
  titulo: {
    margin: "0 0 4px",
    fontSize: "18px",
    fontWeight: "500",
    color: "white",
  },
  subtitulo: {
    margin: 0,
    fontSize: "14px",
    color: "#888",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    color: "#aaa",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "14px",
    color: "#666",
  },
  input: {
    width: "100%",
    padding: "9px 12px 9px 34px",
    background: "#111",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  error: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#2a0000",
    border: "1px solid #ff4d4d",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#ff4d4d",
  },
  boton: {
    width: "100%",
    padding: "10px",
    marginTop: "4px",
    background: "#1e3a5f",
    color: "#7ab3f0",
    border: "1px solid #2a5080",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  registro: {
    textAlign: "center",
    fontSize: "13px",
    color: "#666",
    marginTop: "1.5rem",
    marginBottom: 0,
  },
  link: {
    color: "#7ab3f0",
    textDecoration: "none",
  },
};

export default LoginPage;
