import SignupOutlet from "../../../../features/public/signup/outlets/SignupOutlet";
import EmailVerificationOutlet from "../../../../features/public/emailverification/outlets/EmailVerification";
import SendVerificationMailOutlet from "../../../../features/public/sendVerificationMail/outlets/SendVerificationMail";
import LoginOutlet from "../../../../features/public/login/outlets/LoginOutlet";


export const authRoutes = [
  {
    path: "login",
    element: <LoginOutlet />,
  },
  {
    path:"forgotpassword",
    element: <h1>forgotPassword</h1>
  },
  {
    path: "signup",
    element: <SignupOutlet />,
  },
  {
    path: "sendverificationmail",
    element: <SendVerificationMailOutlet />,
  },
  {
    path: "emailverification/:emailToken",
    element: <EmailVerificationOutlet />,
  },
];
