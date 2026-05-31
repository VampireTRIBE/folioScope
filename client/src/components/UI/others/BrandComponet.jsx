// ! Custom Hooks
import { useNavigationActions } from "../../../features/hooks/customHooks/useNavigationActions";

// ! styles
import BrandComponetStyle from "./brandcomponet.module.css";

const BrandComponet = ({ onClick = null }) => {
  const { gotoHome } = useNavigationActions();
  return (
    <figure
      className={BrandComponetStyle.brand}
      onClick={onClick ? onClick : gotoHome}>
      <img
        className={BrandComponetStyle.brandlogo}
        src="/assets/icons/logo.png"
        alt="Logo"
        title="Logo"></img>
      <figcaption className={BrandComponetStyle.brandname}>
        FolioScope
      </figcaption>
    </figure>
  );
};

export default BrandComponet;
