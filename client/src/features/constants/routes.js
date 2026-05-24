import { AUTHROUTES } from "./AuthRoutes/authRoutes";
import { SECURITY_ROUTES } from "./publicRoutes/securityRoutes";

export const ROUTES = {
  HOME: "/",
  ...AUTHROUTES,
  ...SECURITY_ROUTES,
};
