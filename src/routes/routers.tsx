import { createBrowserRouter, Outlet } from "react-router-dom";
import { Suspense } from "react";
import Login from "../contexts/auth/Login";
import HomePage from "../HomePage";
import ProtectedRoute from "./protectedRoute";
import AdminPage from "../AdminPage";
import PageNotFound from "./pageNotFound";
import SearchResultsPage from "../Search/SearchResultsPage";
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
      // Public routes (không cần auth)
      {
        path: "",
        element: <Login />,
      },
      {
        path: "search-results",
        element: <SearchResultsPage />,
      },

      // Protected routes (cần auth)
      {
        path: "admin",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "homepage",
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <PageNotFound />,
  },
]);
