import Home from "../../../features/public/home/outlets/Home";
import SecurityDashbord from "../../../features/public/securityDashbord/outlets/SecurityDashbord";

export const publicSubRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "login",
    element: <h1>LOGIN</h1>,
  },
  {
    path: "signup",
    element: <h1>SIGNUP</h1>,
  },
  {
    path: "security/:name",
    element: <SecurityDashbord />,
  },
];
