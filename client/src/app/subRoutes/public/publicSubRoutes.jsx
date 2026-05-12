import Home from "../../../features/public/home/outlets/Home";

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
