import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";

// ! Syles
import userDashboardOutletStyles from "./userdashboardoutlet.module.css";

// ! context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Tanstck Query
import { useGROUPMETADATA } from "../hooks/ReactQuery/useQuery";

// ! Layout Components
import PortfolioMetadata from "../layout/portfolioMetaData/PortfolioMetadata";
import PortfolioDetails from "../layout/portfolioDetails/portfolioDetails";

const UserDashboardOutlet = () => {
  const { gp_id } = useParams();
  const { user } = useContext(AuthenticationContext);
  const { goToLogin } = useNavigationActions();

  const {
    data: GroupMeatadataData,
    isPending: GroupMeatadataPending,
    isError: GroupMeatadataisError,
    error: GroupMeatadataError,
  } = useGROUPMETADATA(user, gp_id);

  

  let content = {
    name: GroupMeatadataData?.data?.groupName || "Name",
    category: `Level ${GroupMeatadataData?.data?.level || "-"}`,
    price: {
      currentPrice: 0.0,
      todayChangePercent: "0.00",
    },
  };

  useEffect(() => {
    if (!user) {
      goToLogin();
    }
  }, [user, goToLogin]);

  return (
    <main className={userDashboardOutletStyles.outlet}>
      <PortfolioMetadata content={content} />
      <PortfolioDetails />
    </main>
  );
};

export default UserDashboardOutlet;
