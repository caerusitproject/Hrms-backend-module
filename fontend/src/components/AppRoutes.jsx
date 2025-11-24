// src/components/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTokenRefresh } from "../hooks/useTokenRefresh";
import { useAuth } from "../hooks/useAuth";
import CustomLoader from "../components/common/CustomLoader";
import EmployeeProfile from "../pages/profile/EmployeeProfile";
import EmployeeProfileEdit from "../pages/profile/EmployeeProfileEdit";
import EmployeeProfileView from "../pages/profile/EmployeeProfileView";
import EmployeeList from "../pages/profile/EmployeeList";
import Teamemployee from "../pages/profile/Teamemployee";
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
// Lazy load components
const Login = lazy(() => import("../pages/auth/Login"));
const MainLayout = lazy(() => import("./layout/MainLayout"));
const NotFoundPage = lazy(() => import("./common/NotFoundPage"));
const ProtectedRoute = lazy(() => import("./auth/ProtectedRoute"));
const AdminConfig = lazy(() => import("../pages/admin/AdminConfigurationPage"));
// Lazy load pages
const Home = lazy(() => import("../pages/home/Home"));
const About = lazy(() => import("../pages/about/About"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Attendance = lazy(() => import("../pages/leave-management/Attendance"));
const Leave = lazy(() => import("../pages/leave-management/Leave"));
const Broadcast = lazy(() => import("../pages/broadcast/Broadcast"));
const Payroll = lazy(() => import("../pages/payroll/Payroll"));
const EmailTemplateManager = lazy(() =>
  import("../pages/email-templete/EmailTemplateManager")
);
const SendMailPage = lazy(() => import("../pages/email-templete/SendMailPage"));
const WorkflowConfig = lazy(() =>
  import("../pages/workflow/WorkflowConfig")
);
const WorkflowExecution = lazy(() =>
  import("../pages/workflow/WorkflowExecution")
);




const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="app">
      <Suspense fallback={<CustomLoader />}>
        <ScrollToTop />
        <Routes>
          {/* Root redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Public Login route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Login />
            }
          />


          {/* Protected routes with nested layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="home"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="payroll"
              element={
                <ProtectedRoute requiredRoles={["ADMIN"]}>
                  <Suspense fallback={<CustomLoader />}>
                    <Payroll />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="about"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <About />
                </Suspense>
              }
            />
            <Route
              path="employee"
              element={
                <ProtectedRoute
                  requiredRoles={["ADMIN", "HR", "MANAGER", "USER"]}
                >
                  <Suspense fallback={<CustomLoader />}>
                    <Outlet />
                  </Suspense>
                </ProtectedRoute>
              }
            >
              {/* Create route — restricted to ADMIN, HR, MANAGER */}
              <Route
                path="create"
                element={
                  <ProtectedRoute requiredRoles={["ADMIN", "HR",]}>
                    <EmployeeProfileEdit />
                  </ProtectedRoute>
                }
              />

              {/* Edit route — accessible by all (ADMIN, HR, MANAGER, USER) */}
              <Route
                path="edit/:id"
                element={
                  <ProtectedRoute
                    requiredRoles={["ADMIN", "HR", "MANAGER", "USER"]}
                  >
                    <EmployeeProfileEdit />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="employee-profile/:id"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <EmployeeProfileView />
                </Suspense>
              }
            />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="attendance"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <Attendance />
                </Suspense>
              }
            />
            <Route
              path="leave-management"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <Leave />
                </Suspense>
              }
            />
            <Route
              path="email-templetes"
              element={
                <ProtectedRoute requiredRoles={["ADMIN"]}>
                  <Suspense fallback={<CustomLoader />}>
                    <EmailTemplateManager />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="email-process"
              element={
                <ProtectedRoute requiredRoles={["HR", "ADMIN"]}>
                  <Suspense fallback={<CustomLoader />}>
                    <SendMailPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-config"
              element={
                <ProtectedRoute requiredRoles={["ADMIN", "HR"]}>
                  <Suspense fallback={<CustomLoader />}>
                    <AdminConfig />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="employees-list"
              element={
                <ProtectedRoute requiredRoles={["ADMIN", "HR", "MANAGER"]}>
                  <Suspense fallback={<CustomLoader />}>
                    <EmployeeList />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="my-team"
              element={
                <ProtectedRoute requiredRoles={["MANAGER"]}>
                  <Suspense fallback={<CustomLoader />}>
                    <Teamemployee />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="broadcast"
              element={
                <Suspense fallback={<CustomLoader />}>
                  <Broadcast />
                </Suspense>
              }
            />
          </Route>

          <Route
            path="workflow"
            element={
              <ProtectedRoute requiredRoles={["ADMIN"]}>
                <Suspense fallback={<CustomLoader />}>
                  <WorkflowConfig />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="workflow-execution"
            element={
              <ProtectedRoute requiredRoles={["MANAGER", "HR", "ADMIN"]}>
                <Suspense fallback={<CustomLoader />}>
                  <WorkflowExecution />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for invalid paths */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default AppRoutes;
