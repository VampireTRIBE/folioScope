import { LOADER_SECTION_1 } from "../../../features/public/home/loders/section1/section1.loder";
import Home from "../../../features/public/home/outlets/Home";

export const publicSubRoutes = [
  {
    index: true,
    element: <Home />,
    loader: LOADER_SECTION_1,
    hydrateFallbackElement: (
      <>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
        <h1>hello</h1>
      </>
    ),
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
    path: "/security/:name",
    element: (
      <>
        <h1>securityDataPage</h1>
        <h1>securityDataPage</h1>
        <h1>securityDataPage</h1>
        <h1>securityDataPage</h1>
        <h1>securityDataPage</h1>
        <h1>securityDataPage</h1>
        <h1>securityDataPage</h1>
        <h1>securityDataPage</h1>
        <h1>securityDataPage</h1>
      </>
    ),
  },
];
