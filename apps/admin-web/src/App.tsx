import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { MediaModule } from "./components/MediaModule";
import { AvisosModule } from "./components/AvisosModule";
import { EmpleadosModule } from "./components/EmpleadosModule";

export default function App() {
  const { admin } = useAuth();

  if (!admin) {
    return <Login />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/media" replace />} />
        <Route path="/media" element={<MediaModule />} />
        <Route path="/avisos" element={<AvisosModule />} />
        <Route path="/empleados" element={<EmpleadosModule />} />
      </Route>
    </Routes>
  );
}
