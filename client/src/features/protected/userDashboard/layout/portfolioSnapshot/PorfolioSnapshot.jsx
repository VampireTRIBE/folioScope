// ! UI Components

import PriceBadge from "../../../../../components/layout/public/priceBadge/PriceBadge";
import CurrentStatus from "../../components/UI/snapshotCurrent/SnapshotCurrent";
import CurrentYearPerformence from "../../components/UI/snapshotCurrentYear/SnapshotCurrentYear";
import SnapshotHead from "../../components/UI/snapshotHead/SnapshotHead";
import LifetimePerformence from "../../components/UI/snapshotLifetime/SnapshotLifetime";

// ! Styles
import porfolioSnapshotStyles from "./portfoliosnapshot.module.css";

const PorfolioSnapshot = () => {
  return (
    <div className={porfolioSnapshotStyles.container}>
      <h3 className={porfolioSnapshotStyles.title}>Snapshot</h3>
      <SnapshotHead />
      <CurrentStatus />
      <CurrentYearPerformence />
      <LifetimePerformence />
    </div>
  );
};

export default PorfolioSnapshot;
