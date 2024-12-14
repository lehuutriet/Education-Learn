import { createBrowserRouter, Outlet } from "react-router-dom";
import { Suspense } from "react";
import Login from "../contexts/auth/Login";
import HomePage from "../HomePage";
import ProtectedRoute from "./protectedRoute";
import AdminPage from "../AdminPage";
import PageNotFound from "./pageNotFound";
import SearchResultsPage from "../Search/SearchResultsPage";
import Exercise from "../Education/exercise";

import ClassroomPage from "../Classroom/ClassroomPage";
import ClassroomManagement from "../Classroom/ClassroomManagement";
import Story from "../Education/Story";
import LessonGrid from "../Education/LessonGrid";
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
      // Changed FileViewer to Exercise
      {
        path: "/uploadExercise",
        element: (
          <ProtectedRoute>
            <Exercise />
          </ProtectedRoute>
        ),
      },
      {
        path: "/story",
        element: (
          <ProtectedRoute>
            <Story />
          </ProtectedRoute>
        ),
      },
      {
        path: "/lessonGrid",
        element: (
          <ProtectedRoute>
            <LessonGrid />
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
