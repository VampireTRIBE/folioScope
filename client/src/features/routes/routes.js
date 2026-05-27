import { AUTHROUTES } from "./AuthRoutes/authRoutes";
import { USERROUTES } from "./protectedRoutes/protectedRoutes";
import { SECURITY_ROUTES } from "./publicRoutes/securityRoutes";

export const ROUTES = {
  HOME: "/",
  ...AUTHROUTES,
  ...SECURITY_ROUTES,
  ...USERROUTES,
};
