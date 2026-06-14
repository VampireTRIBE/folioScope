import UserDashboardOutlet from "../../../../features/protected/userDashboard/outlet/UserDashboardOutlet";

export const portfolioRoutes = [
  {
    path: "profile",
    element: <UserDashboardOutlet />,
  },
  {
    path: ":level/:gp_id",
    element: <UserDashboardOutlet />,
  },
];
