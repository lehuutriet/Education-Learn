import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Suspense } from "react";
import Login from "../contexts/auth/Login";
// import ProtectedRoute from "./protectedRoute";
// import WordAlignment from "@/components/WordAlignment";
// import AdminPage from "@/components/AdminPage";
import PageNotFound from "./pageNotFound";

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
      { path: "", element: <Login /> },
      //   {
      //     path: "/admin",
      //     element: (
      //       <ProtectedRoute requiredRole="Admin">
      //         <AdminPage />
      //       </ProtectedRoute>
      //     ),
      //     errorElement: <PageNotFound />,
      //   },
      //   {
      //     path: "/alignment",
      //     element: (
      //       <ProtectedRoute>
      //         <WordAlignment />
      //       </ProtectedRoute>
      //     ),
      //     errorElement: <PageNotFound />,
      //   },
    ],
    errorElement: <PageNotFound />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);
