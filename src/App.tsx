import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import MembershipPortalLayout from "./components/MembershipPortalLayout";
import Voting from "./pages/membership-portal/Voting";
import Discussions from "./pages/membership-portal/Discussions";
import Resources from "./pages/membership-portal/Resources";
import Feed from "./pages/membership-portal/Feed";
import Files from "./pages/membership-portal/Files";
import FileView from "./pages/membership-portal/FileView";
import Directory from "./pages/membership-portal/Directory";
import MemberProfile from "./pages/membership-portal/MemberProfile";
import IndividualMemberProfile from "./pages/membership-portal/IndividualMemberProfile";
import MyProfile from "./pages/membership-portal/MyProfile";
import MyOrganization from "./pages/membership-portal/MyOrganization";
import Admin from "./pages/membership-portal/Admin";
import SummitPlanning from "./pages/membership-portal/SummitPlanning";
import Summit2026 from "./pages/membership-portal/Summit2026";
import Feedback from "./pages/membership-portal/Feedback";
import NotificationPreferences from "./pages/membership-portal/NotificationPreferences";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import MigrateData from "./pages/MigrateData";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Interest from "./pages/Interest";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled promise rejection:', event.reason);
    }
    // Prevent default browser error handling
    event.preventDefault();
  });
}

const App = () => (
  <ErrorBoundary>
    <LanguageProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/interest" element={<Interest />} />
          <Route
            path="/membership-portal"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Feed />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/voting"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Voting />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/discussions"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Discussions />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/resources"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Resources />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/feed"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Feed />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/files"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Files />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/files/:fileId"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <FileView />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/directory"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Directory />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/directory/:id"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <MemberProfile />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/member/:email"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <IndividualMemberProfile />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/profile"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <MyProfile />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/organization"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <MyOrganization />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/feedback"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Feedback />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/notifications"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <NotificationPreferences />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/admin"
            element={
              <ProtectedRoute requireAdmin>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Admin />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/summit-planning"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <SummitPlanning />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/summit-2026"
            element={
              <ProtectedRoute requireAdmin>
                <MembershipPortalLayout>
                  <ErrorBoundary>
                    <Summit2026 />
                  </ErrorBoundary>
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/privacy"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <Privacy />
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/terms"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <Terms />
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-portal/migrate"
            element={
              <ProtectedRoute>
                <MembershipPortalLayout>
                  <MigrateData />
                </MembershipPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
      </ThemeProvider>
    </LanguageProvider>
  </ErrorBoundary>
);

export default App;
