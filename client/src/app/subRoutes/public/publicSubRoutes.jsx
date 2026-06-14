import Home from "../../../features/public/home/outlets/Home";

import { authRoutes } from "./authRoutes/authRoutes";
import { securityRoutes } from "./securityRoutes/securityRoutes";
import { portfolioRoutes } from "./portfolioRoutes/portfolioRoutes";

export const publicSubRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "auth",
    children: authRoutes,
  },
  {
    path: "security",
    children: securityRoutes,
  },
  {
    path: "dashboard/",
    children: portfolioRoutes,
  },
];
