// ! Custom Hooks
import { useNavigationActions } from "../../../features/hooks/customHooks/useNavigationActions";

// ! styles
import BrandComponentStyle from "./brandcomponent.module.css";

const BrandComponent = ({ onClick = null }) => {
  const { gotoHome } = useNavigationActions();
  return (
    <figure
      className={BrandComponentStyle.brand}
      onClick={onClick ? onClick : gotoHome}>
      <img
        className={BrandComponentStyle.brandlogo}
        src="/assets/icons/logo.png"
        alt="Logo"
        title="Logo"></img>
      <figcaption className={BrandComponentStyle.brandname}>
        FolioScope
      </figcaption>
    </figure>
  );
};

export default BrandComponent;
