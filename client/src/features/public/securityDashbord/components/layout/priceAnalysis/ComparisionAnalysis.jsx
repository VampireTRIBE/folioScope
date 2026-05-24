// ! styles
import comparisionAnalysisStyle from "./comparisionAnalysis.module.css";

// ! componets
import Button from "../../../../../../components/UI/buttons/Button";
import { useNavigationActions } from "../../../../../hooks/customHooks/useNavigationActions";

// ! custom Hooks


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
      <div className={comparisionAnalysisStyle.content}>
        <Button {...buttonATTR} />
      </div>
    </div>
  );
};

export default ComparisionAnalysis;
