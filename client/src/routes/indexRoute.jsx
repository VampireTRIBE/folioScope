import { createBrowserRouter } from "react-router-dom";
import { publicSubRoutes } from "./publicRoutes/subRoutes";

import PublicLayout from "../pages/publicPages/PublicLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: publicSubRoutes,
  },
]);
