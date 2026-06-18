const CONFIG = {
  pendiente: { label: "Pendiente", bg: "#2a1f00", color: "#f59e0b", border: "#f59e0b" },
  aprobada:  { label: "Aprobada",  bg: "#002a10", color: "#4dff91", border: "#4dff91" },
  rechazada: { label: "Rechazada", bg: "#2a0000", color: "#ff4d4d", border: "#ff4d4d" },
  cancelada: { label: "Cancelada", bg: "#1a1a1a", color: "#888",    border: "#555"    },
  devuelta:  { label: "Devuelta",  bg: "#001a2a", color: "#7ab3f0", border: "#7ab3f0" },
};

export default function EstadoBadge({ estado }) {
  const cfg = CONFIG[estado] ?? { label: estado, bg: "#1a1a1a", color: "#aaa", border: "#555" };

  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "99px",
      fontSize: "12px",
      fontWeight: "600",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  );
}
