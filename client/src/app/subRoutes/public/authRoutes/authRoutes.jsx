import Login from "../../../../features/public/login/outlets/Login";
import SignupOutlet from "../../../../features/public/signup/outlets/SignupOutlet";
import EmailVerificationOutlet from "../../../../features/public/emailvarification/outlets/EmailVerification";

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
    path: "emailverification/:emailToken",
    element: <EmailVerificationOutlet />,
  },
];
