import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import ApprovalPending from "@/components/ApprovalPending";
import { EmailProtectedRoute, ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetDetail from "./pages/AssetDetail";
import Consumables from "./pages/Consumables";
import SignOut from "./pages/SignOut";
import BulkSignOut from "./pages/BulkSignOut";
import GroupSignouts from "./pages/GroupSignouts";
import Handover from "./pages/Handover";
import Requests from "./pages/Requests";
import Admin from "./pages/Admin";
import Install from "./pages/Install";
import History from "./pages/History";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const Wedding = lazy(() => import("./pages/Wedding"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" richColors closeButton position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/approval-pending" element={<ApprovalPending />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/:id" element={<AssetDetail />} />
              <Route path="/consumables" element={<ProtectedRoute requireRole="asset_manager"><Consumables /></ProtectedRoute>} />
              <Route path="/signout" element={<ProtectedRoute requireRole="staff"><SignOut /></ProtectedRoute>} />
              <Route path="/groupings" element={<ProtectedRoute requireRole="asset_manager"><BulkSignOut /></ProtectedRoute>} />
              <Route path="/group-signouts" element={<ProtectedRoute requireRole="asset_manager"><GroupSignouts /></ProtectedRoute>} />
              <Route path="/signout/bulk" element={<Navigate to="/groupings" replace />} />
              <Route path="/signin" element={<ProtectedRoute requireRole="asset_manager"><SignIn /></ProtectedRoute>} />
              <Route path="/handover" element={<Handover />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/history" element={<History />} />
              <Route
                path="/wedding"
                element={
                  <EmailProtectedRoute allowedEmail="barend@encounterchurch.co.za">
                    <Suspense fallback={null}>
                      <Wedding />
                    </Suspense>
                  </EmailProtectedRoute>
                }
              />
              <Route path="/admin" element={<ProtectedRoute requireRole="admin"><Admin /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute requireRole="admin"><Navigate to="/admin?section=users-roles" replace /></ProtectedRoute>} />
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
