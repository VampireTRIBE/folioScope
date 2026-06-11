// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotHeadSytles from "./snapshothead.module.css";

const SnapshotHead = ({ text, price }) => {
  return (
    <div className={snapshotHeadSytles.container}>
      <h4 className={snapshotHeadSytles.text}>{text || "Group Name"}</h4>
      <div>
        <PriceBadge currency={true} />
      </div>
    </div>
  );
};

export default SnapshotHead;
