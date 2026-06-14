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
  const { gp_id } = useParams();
  const { user } = useContext(AuthenticationContext);
  const { data: GroupMeatadataData } = useGROUPMETADATA(user, gp_id);

  return (
    <div className={portfolioSnapshotStyles.container}>
      <SnapshotConsolidated
        snapshot={GroupMeatadataData?.data?.consolidatedSnapshot}
      />
      <h3 className={portfolioSnapshotStyles.title}>Snapshot</h3>
      <SnapshotHead
        snapshotHead={{
          text: GroupMeatadataData?.data?.groupName,
          price: null, // need to wire
        }}
      />
      <CurrentStatus
        currentStatus={GroupMeatadataData?.data?.currentInvestment}
      />
      <CurrentYearPerformence
        currentYear={GroupMeatadataData?.data?.currentyear}
      />
      <LifetimePerformence lifetime={GroupMeatadataData?.data?.lifetime} />
    </div>
  );
};

export default PortfolioSnapshot;
