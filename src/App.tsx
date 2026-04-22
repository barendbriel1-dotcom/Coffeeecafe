import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetDetail from "./pages/AssetDetail";
import SignOut from "./pages/SignOut";
import Handover from "./pages/Handover";
import Requests from "./pages/Requests";
import Admin from "./pages/Admin";
import Users from "./pages/Users";
import Install from "./pages/Install";
import History from "./pages/History";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" richColors closeButton position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/:id" element={<AssetDetail />} />
              <Route path="/signout" element={<ProtectedRoute requireRole="staff"><SignOut /></ProtectedRoute>} />
              <Route path="/signout/bulk" element={<ProtectedRoute requireRole="staff"><SignOut bulk /></ProtectedRoute>} />
              <Route path="/signin" element={<ProtectedRoute requireRole="admin"><SignIn /></ProtectedRoute>} />
              <Route path="/handover" element={<Handover />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/history" element={<History />} />
              <Route path="/admin" element={<ProtectedRoute requireRole="admin"><Admin /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute requireRole="admin"><Users /></ProtectedRoute>} />
              <Route path="/install" element={<Install />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
