import UserDashboardOutlet from "../../../../features/protected/userDashboard/outlet/UserDashboardOutlet";

export const portfolioRoutes = [
  {
    index: true,
    element: <UserDashboardOutlet />,
  },
  {
    path: "profile",
    element: <UserDashboardOutlet />,
  },
];
