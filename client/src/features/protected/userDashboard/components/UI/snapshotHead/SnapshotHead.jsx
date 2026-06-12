// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotHeadSytles from "./snapshothead.module.css";

const SnapshotHead = ({ snapshotHead = null }) => {
  return (
    <div className={snapshotHeadSytles.container}>
      <h4 className={snapshotHeadSytles.text}>
        {snapshotHead?.text || "Group Name"}
      </h4>
      <div>
        <PriceBadge price={snapshotHead?.price} currency={true} />
      </div>
    </div>
  );
};

export default SnapshotHead;
