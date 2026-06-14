import SignupOutlet from "../../../../features/public/Authentication/signup/outlets/SignupOutlet";
import EmailVerificationOutlet from "../../../../features/public/Authentication/emailverification/outlets/EmailVerification";
import SendVerificationMailOutlet from "../../../../features/public/Authentication/sendVerificationMail/outlets/SendVerificationMail";
import LoginOutlet from "../../../../features/public/Authentication/login/outlets/LoginOutlet";
import SendOTPMailOutlet from "../../../../features/public/Authentication/sendOTPMail/outlets/SendOTPMailOutlet";
import SubmitOtpOutlet from "../../../../features/public/Authentication/otpSubmit/outlets/SubmitOtpOutlet";
import ConfirmPasswordOutlet from "../../../../features/public/Authentication/confirmPassword/outlets/ConfirmPasswordOutlet";

export const authRoutes = [
  {
    path: "login",
    element: <LoginOutlet />,
  },
  {
    path: "forgotpassword",
    element: <SendOTPMailOutlet />,
  },
  {
    path: "otp",
    element: <SubmitOtpOutlet />,
  },
  {
    path: "confirmpassword",
    element: <ConfirmPasswordOutlet />,
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
