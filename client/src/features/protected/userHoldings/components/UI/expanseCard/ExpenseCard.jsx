// ! Styles
import costStructureStyles from "./coststructure.module.css";

const CostStructure = ({
  title = "Bucket Cost",
  totalExpenseRatio = "0.00%",
  progress = 0,
  annualCost = 0,
}) => {
  const safeProgress = Math.min(Math.max(Number(progress), 0), 100);

  return (
    <div className={costStructureStyles.container}>
      <h3 className={costStructureStyles.title}>{title}</h3>

      <div className={costStructureStyles.content}>
        <div>
          <div className={costStructureStyles.statRow}>
            <span className={costStructureStyles.label}>Total Expense Ratio</span>
            <span className={costStructureStyles.value}>
              {totalExpenseRatio}
            </span>
          </div>

          <div className={costStructureStyles.progressTrack}>
            <div
              className={costStructureStyles.progressFill}
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        <div className={costStructureStyles.costBox}>
          <div className={costStructureStyles.costLabel}>Est. Annual Cost</div>

          <div className={costStructureStyles.costValue}>
            ₹{Number(annualCost).toFixed(2).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostStructure;