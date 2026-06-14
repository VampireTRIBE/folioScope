import SecurityDashboard from "../../../../features/public/securityDashboard/outlets/SecurityDashboard";

export const securityRoutes = [
  {
    path: ":securityID",
    element: <SecurityDashboard />,
  },
];
