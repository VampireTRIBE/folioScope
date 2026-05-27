import { createBrowserRouter } from "react-router-dom";
import { publicSubRoutes } from "./subRoutes/public/publicSubRoutes";
import PublicLayout from "../pages/publicPages/PublicLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: publicSubRoutes,
  },
  {
    path: "/portfolio",
    element: <h1>User DashBord</h1>,
  },
]);
