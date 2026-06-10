// ! styles
import comparisionAnalysisStyle from "./comparisionAnalysis.module.css";

// ! componets
// import Button from "../../../../../components/UI/buttons/Button";

// ! custom Hooks
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";

const ComparisionAnalysis = () => {
  const { goToLogin } = useNavigationActions();

  const buttonATTR = {
    text: "Login To Your Account",
    varient: "buttonBlackSquare",
    onClick: goToLogin,
  };

  return (
    <div id="comparison" className={comparisionAnalysisStyle.container}>
      <h3 className={comparisionAnalysisStyle.title}>Comparison Analysis</h3>
    </div>
  );
};

export default ComparisionAnalysis;
