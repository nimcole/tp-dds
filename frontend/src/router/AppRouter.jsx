import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import SolicitudesList from "../componentes/SolicitudesList.jsx";
import ResumenPage from "../pages/ResumenPage.jsx";
import HistorialPage from "../pages/HistorialPage.jsx";
import SolicitudesDetalle from "../pages/DetalleSolicitud"

const ProtectedRoute = ({ children, roles }) => {
  const { usuario, token } = useAuth();

  if (!token || !usuario) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/solicitudes" />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas — los otros devs agregan las suyas acá */}
        <Route
          path="/solicitudes"
          element={
            <ProtectedRoute>
              <SolicitudesList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/solicitudes/:id"
          element={
            <ProtectedRoute>
              <SolicitudesDetalle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resumen"
          element={
            <ProtectedRoute roles={["admin", "encargado"]}>
              <ResumenPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/historial/:id"
          element={
            <ProtectedRoute>
              <HistorialPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
