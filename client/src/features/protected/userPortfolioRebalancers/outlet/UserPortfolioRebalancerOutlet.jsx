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

const isEmpty = (value) => {
  return value === null || value === undefined || value === "";
};

const formatNumber = (value, digits = 2) => {
  if (isEmpty(value)) return "-";

  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const formatCurrency = (value) => {
  if (isEmpty(value)) return "-";
  return `Rs.${formatNumber(value)}`;
};

const formatPercent = (value) => {
  if (isEmpty(value)) return "-";
  return `${formatNumber(value)}%`;
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatBoolean = (value) => {
  return value ? "Yes" : "No";
};

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

          {!!rebalancer.marketFallRulesStats?.length && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h4>Market Fall Deployment Stats</h4>
                  <p className={styles.subtitle}>
                    Deployment tiers, benchmark drawdown and asset deployment
                    amounts.
                  </p>
                </div>
              </div>

              <div className={styles.cardGrid}>
                {rebalancer.marketFallRulesStats.map((rule, index) => {
                  const deploymeta = rule?.deploymeta || {};
                  const benchmark = rule?.benchmark || {};

                  return (
                    <article
                      className={styles.card}
                      key={`${deploymeta.fallPercentage}-${index}`}>
                      <div className={styles.ruleHeader}>
                        <h4 className={styles.cardTitle}>
                          Market Fall {formatPercent(deploymeta.fallPercentage)}
                        </h4>

                        <span
                          className={`${styles.statusBadge} ${
                            deploymeta.isTriggered
                              ? styles.active
                              : styles.inactive
                          }`}>
                          {deploymeta.status || "No Status"}
                        </span>
                      </div>

                      <div className={styles.detailGrid}>
                        <div>
                          <span>Deploy %</span>
                          <strong>
                            {formatPercent(deploymeta.deployPercentage)}
                          </strong>
                        </div>
                        <div>
                          <span>Deploy Amount</span>
                          <strong>
                            {formatCurrency(deploymeta.deployAmount)}
                          </strong>
                        </div>
                        <div>
                          <span>Shot Number</span>
                          <strong>{formatNumber(deploymeta.shotNumber, 0)}</strong>
                        </div>
                        <div>
                          <span>Triggered</span>
                          <strong>{formatBoolean(deploymeta.isTriggered)}</strong>
                        </div>
                        <div>
                          <span>Locked</span>
                          <strong>{formatBoolean(deploymeta.isLocked)}</strong>
                        </div>
                        <div>
                          <span>Last Deployed</span>
                          <strong>{formatDate(deploymeta.lastDeployed)}</strong>
                        </div>
                        <div>
                          <span>Action</span>
                          <strong>{deploymeta.action || "-"}</strong>
                        </div>
                      </div>

                      <div className={styles.benchmarkBox}>
                        <div className={styles.sectionHeader}>
                          <h4 className={styles.subTitle}>Benchmark</h4>
                          <span className={styles.ruleBadge}>
                            {benchmark.benchmarkname || "Benchmark"}
                          </span>
                        </div>

                        <div className={styles.detailGrid}>
                          <div>
                            <span>Max Price</span>
                            <strong>{formatCurrency(benchmark.maxPrice)}</strong>
                          </div>
                          <div>
                            <span>Current Price</span>
                            <strong>
                              {formatCurrency(benchmark.currentPrice)}
                            </strong>
                          </div>
                          <div>
                            <span>Fall</span>
                            <strong>
                              {formatPercent(benchmark.fallPercentage)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className={styles.deploymentList}>
                        <h4 className={styles.subTitle}>Assets</h4>

                        {(rule.assets || []).map((asset, assetIndex) => (
                          <div
                            className={styles.deploymentStatsRow}
                            key={`${asset.assetName}-${assetIndex}`}>
                            <strong>{asset.assetName || "Asset"}</strong>
                            <span>Multiplier {formatNumber(asset.multiplier)}</span>
                            <span>Min {formatNumber(asset.min)}</span>
                            <span>Score {formatNumber(asset.score)}</span>
                            <span>
                              Deploy {formatCurrency(asset.deployAmount)}
                            </span>
                            <span>Max {formatCurrency(asset.maxPrice)}</span>
                            <span>
                              Current {formatCurrency(asset.currentPrice)}
                            </span>
                            <span>
                              Fall {formatPercent(asset.fallPercentage)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default UserPortfolioRebalencerOutlet;
