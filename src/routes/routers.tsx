// src/routers.tsx
import { createBrowserRouter, Outlet } from "react-router-dom";
import { Suspense } from "react";
import Login from "../contexts/auth/Login";
import HomePage from "../HomePage";
import ProtectedRoute from "./protectedRoute";
import AdminPage from "../AdminPage";
import PageNotFound from "./pageNotFound";
import SearchResultsPage from "../Search/SearchResultsPage";
import FileViewer from "../Education/exercise";
import ClassroomPortal from "../Classroom/ClassroomPortal";
import ClassroomPage from "../Classroom/ClassroomPage";
import ClassroomManagement from "../Classroom/ClassroomManagement";
const App = () => {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center">
          {/* <Spinner size="xl" /> */}
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
};

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public routes
      {
        path: "",
        element: <Login />,
      },
      {
        path: "/search-results",
        element: <SearchResultsPage />,
      },

      // Protected routes
      {
        path: "/admin",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/homepage",
        element: <HomePage />,
      },
      // Add FileViewer route
      {
        path: "/education",
        element: (
          <ProtectedRoute>
            <FileViewer />
          </ProtectedRoute>
        ),
      },
      {
        path: "/classroomManagement",
        element: (
          <ProtectedRoute>
            <ClassroomManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/classroom-portal",
        element: (
          <ProtectedRoute>
            <ClassroomPortal />
          </ProtectedRoute>
        ),
      },
      {
        path: "/classroom/:classroomId",
        element: (
          <ProtectedRoute>
            <ClassroomPage />
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <PageNotFound />,
  },
]);
