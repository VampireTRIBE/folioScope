import SecurityDashbord from "../../../../features/public/securityDashbord/outlets/SecurityDashbord";

export const securityRoutes = [
  {
    path: ":securityID",
    element: <SecurityDashbord />,
  },
];
