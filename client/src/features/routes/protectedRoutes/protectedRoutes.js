export const USERROUTES = {
  USERPROFILE: "/dashboard/profile",
  USERHOLDINGS: "/dashboard/holdings",
  USERPORTFOLIOREBALENCERLIST: "/dashboard/rebalencer/list",
  USERPORTFOLIOREBALENCERNEW: "/dashboard/rebalencer/new",
  USERPORTFOLIOREBALENCER: (rebalancerId) =>
    `/dashboard/rebalencer/${rebalancerId}`,
  USERDASHBOARD: (level, groupId) => `/dashboard/${level}/${groupId}`,
};
