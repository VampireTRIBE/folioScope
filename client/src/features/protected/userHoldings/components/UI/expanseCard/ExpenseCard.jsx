// ! Styles
import costStructureStyles from "./coststructure.module.css";

const CostStructure = ({
  title = "Cost Structure",
  totalExpenseRatio = "0.40%",
  progress = 35,
  annualCost = 2938,
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
            ₹{Number(annualCost).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostStructure;