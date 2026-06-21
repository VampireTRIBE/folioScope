import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "react-redux";
import { router } from "./app/router";
import store from "./app/store";
import { AuthenticationProvider } from "./context/authenticationContext";
import AppInitializerWithSessionStorage from "./CustomProviders/AppInitializerWithSessionStorage";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthenticationProvider>
        <AppInitializerWithSessionStorage />
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthenticationProvider>
    </QueryClientProvider>
  </Provider>,
);
