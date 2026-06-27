import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";

// ! Styles
import styles from "./userportfolioreblanceroutlet.module.css";

// ! Context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Tanstack Query
import { useRebalancerQuery } from "../hooks/ReactQuery/useQuery";

// ! Rebalancer Components
import AssetLevelRebalancerCards from "../layout/Rebalancer/assetlevelRebalancer/AssetLevelRebalancerCards";
import RebalancerCategoryCards from "../layout/Rebalancer/grouplevelRebalancer/RebalancerCategoryCards";
import RebalancerHead from "../layout/Rebalancer/rebalancerHead/RebalancerHead";

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Failed to fetch rebalancer"
  );
};

const UserPortfolioRebalencerOutlet = () => {
  const { rebalancerId } = useParams();
  const { accessToken } = useContext(AuthenticationContext);
  const {
    goToLogin,
    goToUserPortfolioRebalencerList,
    goToUserPortfolioRebalencerNew,
  } = useNavigationActions();
  const {
    data: rebalancerResponse,
    isPending,
    isError,
    error,
  } = useRebalancerQuery(accessToken, rebalancerId);

  const rebalancer = rebalancerResponse?.data;

  useEffect(() => {
    if (!accessToken) {
      goToLogin();
    }
  }, [accessToken, goToLogin]);

  return (
    <main className={styles.outlet}>
      <section className={styles.pageHeader}>
        <button
          className={styles.textButton}
          type="button"
          onClick={goToUserPortfolioRebalencerList}>
          Back to list
        </button>

        <button
          className={styles.primaryButton}
          type="button"
          onClick={goToUserPortfolioRebalencerNew}>
          New Rebalancer
        </button>
      </section>

      {isPending && <div className={styles.stateBox}>Loading rebalancer...</div>}

      {isError && <div className={styles.errorBox}>{getErrorMessage(error)}</div>}

      {!isPending && !isError && rebalancer && (
        <>
          <RebalancerHead rebalancer={rebalancer} />

          <RebalancerCategoryCards data={rebalancer.groupLevelData || []} />

          <AssetLevelRebalancerCards data={rebalancer.assetLevelData || []} />
        </>
      )}
    </main>
  );
};

export default UserPortfolioRebalencerOutlet;
