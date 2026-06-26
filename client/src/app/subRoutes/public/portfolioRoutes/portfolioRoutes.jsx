// ! Page Outlets

// ! User Dashboard Page
import UserDashboardOutlet from "../../../../features/protected/userDashboard/outlet/UserDashboardOutlet";

// ! User HoldingsOutlet
import UserHoldingsOutlet from "../../../../features/protected/userHoldings/outlet/UserHoldingsOutlet";

// ! User Profile Outlet
import UserProfileOutlet from "../../../../features/protected/userProfile/outlet/UserProfileOutlet";

// ! User Portfolio Rebalncer Outlet
import UserPortfolioRebalencerOutlet from "../../../../features/protected/userPortfolioRebalancers/outlet/UserPortfolioRebalancerOutlet";

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
    path: "rebalencer",
    element: <UserPortfolioRebalencerOutlet />,
  },
  {
    path: "rebalencer/create",
    element: <UserPortfolioRebalencerOutlet />,
  },
  {
    path: ":level/:gp_id",
    element: <UserDashboardOutlet />,
  },
];
