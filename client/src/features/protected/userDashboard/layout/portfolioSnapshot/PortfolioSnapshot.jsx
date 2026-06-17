import { useContext } from "react";
import { useParams } from "react-router-dom";

// ! UI Components
import PriceBadge from "../../../../../components/layout/public/priceBadge/PriceBadge";
import SnapshotConsolidated from "../../components/UI/snapshotConsolidated/SnapshotConsolidated";
import CurrentStatus from "../../components/UI/snapshotCurrent/SnapshotCurrent";
import CurrentYearPerformence from "../../components/UI/snapshotCurrentYear/SnapshotCurrentYear";
import SnapshotHead from "../../components/UI/snapshotHead/SnapshotHead";
import LifetimePerformence from "../../components/UI/snapshotLifetime/SnapshotLifetime";

// ! Styles
import portfolioSnapshotStyles from "./portfoliosnapshot.module.css";

// ! Context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

// ! Tanstack Query
import { useGROUPMETADATA } from "../../hooks/ReactQuery/useQuery";

const PortfolioSnapshot = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const groupId = `${userData?.groups?.[`level${level}`]?.[gp_id]?._id}`;
  const { data: GroupMeatadataData } = useGROUPMETADATA(accessToken, groupId);

  return (
    <div className={portfolioSnapshotStyles.container}>
      <SnapshotConsolidated
        snapshot={GroupMeatadataData?.data?.consolidatedSnapshot}
      />
      <h3 className={portfolioSnapshotStyles.title}>Snapshot</h3>
      <SnapshotHead
        snapshotHead={{
          text: GroupMeatadataData?.data?.groupName,
          price: {
            price:GroupMeatadataData?.data?.networth?.currentPrice,
            today:GroupMeatadataData?.data?.networth?.todayChange,
          }
        }}
      />
      <CurrentStatus
        currentStatus={GroupMeatadataData?.data?.currentInvestment}
      />
      <CurrentYearPerformence
        currentyear={GroupMeatadataData?.data?.currentyear}
      />
      <LifetimePerformence lifetime={GroupMeatadataData?.data?.lifetime} />
    </div>
  );
};

export default PortfolioSnapshot;
