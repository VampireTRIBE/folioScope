import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";

// ! Syles
import userDashboardOutletStyles from "./userdashboardoutlet.module.css";

// ! context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Tanstck Query
import {
  use1DNavRangeGroup,
  useGROUPMETADATA,
} from "../hooks/ReactQuery/useQuery";

// ! Layout Components
import PortfolioMetadata from "../layout/portfolioMetaData/PortfolioMetadata";
import PortfolioDetails from "../layout/portfolioDetails/portfolioDetails";

const UserDashboardOutlet = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const { goToLogin } = useNavigationActions();
  const groupId = `${userData?.groups?.[`level${level}`]?.[gp_id]?._id}`;

  const {
    data: GroupMeatadataData,
    isPending: GroupMeatadataPending,
    isError: GroupMeatadataisError,
    error: GroupMeatadataError,
  } = useGROUPMETADATA(accessToken, groupId);

  const {
    data: nav1DData,
    isPending: nav1DPending,
    isError: nav1DisError,
    error: nav1DError,
  } = use1DNavRangeGroup(groupId, accessToken);

  const content = {
    name: GroupMeatadataData?.data?.groupName || "Name",
    category: `Level ${GroupMeatadataData?.data?.level || "-"}`,
    price: {
      currentPrice: nav1DData?.currentPrice,
      todayChangePercent: nav1DData?.todayChange,
    },
  };

  useEffect(() => {
    if (!accessToken) {
      goToLogin();
    }
  }, [accessToken, goToLogin]);

  return (
    <main className={userDashboardOutletStyles.outlet}>
      <PortfolioMetadata content={content} />
      <PortfolioDetails />
    </main>
  );
};

export default UserDashboardOutlet;
