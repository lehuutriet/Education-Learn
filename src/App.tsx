import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "./contexts/auth/authProvider";
import { Notifications } from "@mantine/notifications";
import { RouterProvider } from "react-router-dom";
import { Router } from "./routes/routers";
import { theme } from "../theme";

import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "../src/ui/button";
import { Spinner } from "../src/ui/spinner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mantine/notifications/styles.css";

const ErrorFallback = () => (
  <div
    className="text-red-500 w-screen h-screen flex flex-col justify-center items-center"
    role="alert"
  >
    <h2 className="text-lg font-semibold">Ooops, something went wrong :( </h2>
    <Button
      className="mt-4"
      onClick={() => window.location.assign(window.location.href)}
    >
      Refresh
    </Button>
  </div>
);

type AppProviderProps = {};

const queryClient = new QueryClient();

export const App = ({}: AppProviderProps) => (
  <React.Suspense
    fallback={
      <div className="flex items-center justify-center w-screen h-screen">
        <Spinner size="xl" />
      </div>
    }
  >
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <AuthProvider>
            <Notifications />
            <RouterProvider router={Router} />
          </AuthProvider>
        </MantineProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.Suspense>
);

export default App;
