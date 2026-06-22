// ! Page Outlets


// ! User Dashboard Page
import UserDashboardOutlet from "../../../../features/protected/userDashboard/outlet/UserDashboardOutlet";

// ! User HoldingsOutlet
import UserHoldingsOutlet from "../../../../features/protected/userHoldings/outlet/UserHoldingsOutlet";

// ! User Profile Outlet
import UserProfileOutlet from "../../../../features/protected/userProfile/outlet/UserProfileOutlet";

export const portfolioRoutes = [
  {
    path: "profile",
    element: <UserProfileOutlet />,
  },
  {
    path: "holdings",
    element: <UserHoldingsOutlet />,
  },
  {
    path: ":level/:gp_id",
    element: <UserDashboardOutlet />,
  },
];
