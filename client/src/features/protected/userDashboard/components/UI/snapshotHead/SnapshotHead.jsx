// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotHeadStyles from "./snapshothead.module.css";

const SnapshotHead = ({ snapshotHead = null }) => {
  return (
    <div className={snapshotHeadStyles.container}>
      <h4 className={snapshotHeadStyles.text}>
        {snapshotHead?.text || "Group Name"}
      </h4>
      <div>
        <PriceBadge price={snapshotHead?.price} currency={true} />
      </div>
    </div>
  );
};

export default SnapshotHead;
