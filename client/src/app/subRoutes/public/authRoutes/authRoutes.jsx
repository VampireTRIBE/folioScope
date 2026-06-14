import SignupOutlet from "../../../../features/public/signup/outlets/SignupOutlet";
import EmailVerificationOutlet from "../../../../features/public/emailverification/outlets/EmailVerification";
import SendVerificationMailOutlet from "../../../../features/public/sendVerificationMail/outlets/SendVerificationMail";
import LoginOutlet from "../../../../features/public/login/outlets/LoginOutlet";
import SendOTPMailOutlet from "../../../../features/public/sendOTPMail/outlets/SendOTPMailOutlet";
import SubmitOtpOutlet from "../../../../features/public/otpSubmit/outlets/submitOtpOutlet";
import ConfirmPasswordOutlet from "../../../../features/public/confirmPassword/outlets/ConfirmPasswordOutlet";

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
