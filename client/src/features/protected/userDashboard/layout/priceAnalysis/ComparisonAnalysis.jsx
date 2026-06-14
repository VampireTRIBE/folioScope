// ! styles
import comparisonAnalysisStyle from "./comparisonAnalysis.module.css";

// ! components
// import Button from "../../../../../components/UI/buttons/Button";

// ! custom Hooks
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";

const ComparisonAnalysis = () => {
  const { goToLogin } = useNavigationActions();

  const buttonATTR = {
    text: "Login To Your Account",
    varient: "buttonBlackSquare",
    onClick: goToLogin,
  };

  return (
    <div id="comparison" className={comparisonAnalysisStyle.container}>
      <h3 className={comparisonAnalysisStyle.title}>Comparison Analysis</h3>
    </div>
  );
};

export default ComparisonAnalysis;
