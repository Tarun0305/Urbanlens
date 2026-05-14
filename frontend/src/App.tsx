import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Leaderboard from "./pages/Leaderboard";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import CitizenDashboard from "./pages/citizen/Dashboard";
import ReportForm from "./pages/citizen/ReportForm";
import MyReports from "./pages/citizen/MyReports";
import MunicipalDashboard from "./pages/municipal/Dashboard";
import IssueList from "./pages/municipal/IssueList";
import ContractorBoard from "./pages/municipal/ContractorBoard";
import ContractorDashboard from "./pages/contractor/Dashboard";
import MyTasks from "./pages/contractor/MyTasks";
import ProgressUpload from "./pages/contractor/ProgressUpload";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManager from "./pages/admin/UserManager";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute roles={["citizen"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute roles={["citizen"]}>
              <ReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/reports"
          element={
            <ProtectedRoute roles={["citizen"]}>
              <MyReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/municipal/dashboard"
          element={
            <ProtectedRoute roles={["municipal"]}>
              <MunicipalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/municipal/issues"
          element={
            <ProtectedRoute roles={["municipal"]}>
              <IssueList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/municipal/contractors"
          element={
            <ProtectedRoute roles={["municipal"]}>
              <ContractorBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contractor/dashboard"
          element={
            <ProtectedRoute roles={["contractor"]}>
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contractor/tasks"
          element={
            <ProtectedRoute roles={["contractor"]}>
              <MyTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contractor/progress"
          element={
            <ProtectedRoute roles={["contractor"]}>
              <ProgressUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <UserManager />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
