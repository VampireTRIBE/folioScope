import { useContext, useEffect } from "react";

// ! Styles
import styles from "./userportfolioreblancerListoutlet.module.css";

// ! Context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Tanstack Query
import { useRebalancerListQuery } from "../hooks/ReactQuery/useQuery";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTotalWeight = (assets = []) => {
  return assets.reduce((total, asset) => {
    return total + Number(asset?.targetWeight || 0);
  }, 0);
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Failed to fetch rebalancers"
  );
};

const UserPortfolioRebalencerListOutlet = () => {
  const { accessToken } = useContext(AuthenticationContext);
  const {
    goToLogin,
    goToUserPortfolioRebalencer,
    goToUserPortfolioRebalencerNew,
  } = useNavigationActions();
  const {
    data: rebalancerListResponse,
    isPending,
    isError,
    error,
  } = useRebalancerListQuery(accessToken);

  const rebalancers = rebalancerListResponse?.data || [];

  useEffect(() => {
    if (!accessToken) {
      goToLogin();
    }
  }, [accessToken, goToLogin]);

  return (
    <main className={styles.outlet}>
      <section className={styles.header}>
        <div>
          <h3 className={styles.title}>Portfolio Rebalancers</h3>
          <p className={styles.subtitle}>
            Manage allocation rules and market fall deployment rules.
          </p>
        </div>

        <button
          className={styles.primaryButton}
          type="button"
          onClick={goToUserPortfolioRebalencerNew}>
          New Rebalancer
        </button>
      </section>

      {isPending && <div className={styles.stateBox}>Loading rebalancers...</div>}

      {isError && <div className={styles.errorBox}>{getErrorMessage(error)}</div>}

      {!isPending && !isError && !rebalancers.length && (
        <section className={styles.emptyBox}>
          <h4>No rebalancers yet</h4>
          <p>Create a rebalancer to start tracking allocation and deployment rules.</p>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={goToUserPortfolioRebalencerNew}>
            Create Rebalancer
          </button>
        </section>
      )}

      {!!rebalancers.length && (
        <section className={styles.grid}>
          {rebalancers.map((rebalancer) => {
            const totalWeight = getTotalWeight(rebalancer.assets);

            return (
              <article className={styles.card} key={rebalancer._id}>
                <div className={styles.cardHeader}>
                  <div>
                    <h4 className={styles.cardTitle}>
                      {rebalancer.rebalancerName}
                    </h4>
                    <p className={styles.cardDescription}>
                      {rebalancer.rebalancerDescription || "No description"}
                    </p>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${
                      rebalancer.isActive ? styles.active : styles.inactive
                    }`}>
                    {rebalancer.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className={styles.statsGrid}>
                  <div>
                    <span>Assets</span>
                    <strong>{rebalancer.assets?.length || 0}</strong>
                  </div>
                  <div>
                    <span>Deploy Rules</span>
                    <strong>{rebalancer.marketFallRules?.length || 0}</strong>
                  </div>
                  <div>
                    <span>Total Weight</span>
                    <strong>{totalWeight.toFixed(2)}%</strong>
                  </div>
                  <div>
                    <span>Updated</span>
                    <strong>{formatDate(rebalancer.updatedAt)}</strong>
                  </div>
                </div>

                <div className={styles.assetPreview}>
                  {(rebalancer.assets || []).slice(0, 4).map((asset) => (
                    <span key={`${rebalancer._id}-${asset.assetId}`}>
                      {asset.assetName} {Number(asset.targetWeight || 0).toFixed(2)}%
                    </span>
                  ))}
                  {(rebalancer.assets?.length || 0) > 4 && (
                    <span>+{rebalancer.assets.length - 4} more</span>
                  )}
                </div>

                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => goToUserPortfolioRebalencer(rebalancer._id)}>
                  Open Rebalancer
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default UserPortfolioRebalencerListOutlet;
