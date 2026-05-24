import Login from "../../../../features/public/login/outlets/Login";
import SignupOutlet from "../../../../features/public/signup/outlets/SignupOutlet";

export const authRoutes = [
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <SignupOutlet />,
  },
  {
    path: "emailverification",
    element: <SignupOutlet />,
  },
];
