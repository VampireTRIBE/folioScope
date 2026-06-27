// ! Page Outlets

// ! User Dashboard Page
import UserDashboardOutlet from "../../../../features/protected/userDashboard/outlet/UserDashboardOutlet";

// ! User HoldingsOutlet
import UserHoldingsOutlet from "../../../../features/protected/userHoldings/outlet/UserHoldingsOutlet";

// ! User Profile Outlet
import UserProfileOutlet from "../../../../features/protected/userProfile/outlet/UserProfileOutlet";

// ! User Portfolio Rebalncer Outlet
import UserPortfolioRebalencerOutlet from "../../../../features/protected/userPortfolioRebalancers/outlet/UserPortfolioRebalancerOutlet";
import UserPortfolioRebalencerNewOutlet from "../../../../features/protected/userPortfolioRebalancers/outlet/UserPortfolioRebalancerNewOutlet";
import UserPortfolioRebalencerListOutlet from "../../../../features/protected/userPortfolioRebalancers/outlet/UserPortfolioRebalancerListOutlet";

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
    path: "rebalencer/list",
    element: <UserPortfolioRebalencerListOutlet />,
  },
  {
    path: "rebalencer/new",
    element: <UserPortfolioRebalencerNewOutlet />,
  },
  {
    path: "rebalencer/:rebalancerId",
    element: <UserPortfolioRebalencerOutlet />,
  },
  {
    path: ":level/:gp_id",
    element: <UserDashboardOutlet />,
  },
];
