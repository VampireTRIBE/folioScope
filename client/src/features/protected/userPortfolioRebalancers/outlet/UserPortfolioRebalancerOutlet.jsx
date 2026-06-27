import { useContext, useEffect, useMemo } from "react";
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

const formatNumber = (value, digits = 2) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Failed to fetch rebalancer"
  );
};

const getRelBand = (asset) => {
  const targetWeight = Number(asset?.targetWeight || 0);
  const band = Number(asset?.band || 0);

  if (!targetWeight) return null;

  return (band / targetWeight) * 100;
};

const getValue = (...values) => {
  return values.find(
    (value) => value !== null && value !== undefined && value !== "",
  );
};

const getAssetLevelData = (assets = []) => {
  return assets.map((asset) => {
    const weight = Number(asset?.targetWeight || 0);
    const band = Number(asset?.band || 0);
    const currentWeight = getValue(asset?.currentWeight, weight);

    return {
      asset: asset?.assetName || "Asset",
      assetType: getValue(asset?.assetType, asset?.groupName, "ALLOCATION_RULE"),
      weight,
      band,
      relBand: getValue(asset?.relBand, getRelBand(asset)),
      upperLimit: getValue(asset?.upperLimit, weight + band),
      lowerLimit: getValue(asset?.lowerLimit, Math.max(weight - band, 0)),
      investedValue: getValue(asset?.investedValue, asset?.invested),
      currentValue: getValue(asset?.currentValue, asset?.current),
      profitLoss: getValue(asset?.profitLoss, asset?.profitloss),
      profitLossPercent: getValue(
        asset?.profitLossPercent,
        asset?.profitLossPercentage,
      ),
      currentWeight,
      drift: getValue(asset?.drift, Number(currentWeight || 0) - weight),
      multiplier: asset?.multiplier,
      discountFactor: asset?.discountFactor,
      sipScore: asset?.sipScore,
      lumpsumScore: asset?.lumpsumScore,
      status: getValue(asset?.status, "INSIDE"),
      driftAmount: asset?.driftAmount,
      rawSip: asset?.rawSip,
      finalSip: asset?.finalSip,
      lumpsumAmount: asset?.lumpsumAmount,
    };
  });
};

const getGroupLevelData = (assets = []) => {
  const groups = new Map();

  assets.forEach((asset) => {
    const groupName = asset?.groupName || "Ungrouped";
    const existingGroup = groups.get(groupName) || {
      categoryLevel: groupName,
      weight: 0,
      band: 0,
      count: 0,
      currentValue: 0,
      currentWeight: 0,
      displayValue: 0,
      drift: 0,
      driftAmount: 0,
    };

    existingGroup.weight += Number(asset?.targetWeight || 0);
    existingGroup.band += Number(asset?.band || 0);
    existingGroup.currentWeight += Number(
      getValue(asset?.currentWeight, asset?.targetWeight, 0),
    );
    existingGroup.currentValue += Number(
      getValue(asset?.currentValue, asset?.current, 0),
    );
    existingGroup.displayValue += Number(
      getValue(asset?.displayValue, asset?.currentValue, asset?.current, 0),
    );
    existingGroup.driftAmount += Number(getValue(asset?.driftAmount, 0));
    existingGroup.count += 1;

    groups.set(groupName, existingGroup);
  });

  return Array.from(groups.values()).map((group) => {
    const averageBand = group.count ? group.band / group.count : 0;

    return {
      ...group,
      band: averageBand,
      upperLimit: group.weight + averageBand,
      lowerLimit: Math.max(group.weight - averageBand, 0),
      status: "INSIDE",
    };
  });
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
  const assetLevelData = useMemo(
    () => getAssetLevelData(rebalancer?.assets || []),
    [rebalancer],
  );
  const groupLevelData = useMemo(
    () => getGroupLevelData(rebalancer?.assets || []),
    [rebalancer],
  );

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

          <RebalancerCategoryCards data={groupLevelData} />

          <AssetLevelRebalancerCards data={assetLevelData} />

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Market Fall Deployment</h4>
            </div>

            <div className={styles.cardGrid}>
              {(rebalancer.marketFallRules || []).map((rule, index) => (
                <article
                  className={styles.card}
                  key={`${rule.fallPercentage}-${index}`}>
                  <div className={styles.ruleHeader}>
                    <h4 className={styles.cardTitle}>
                      Market Fall {formatNumber(rule.fallPercentage)}%
                    </h4>
                    <span className={styles.ruleBadge}>
                      Deploy {formatNumber(rule.deployPercentage)}%
                    </span>
                  </div>

                  <div className={styles.deploymentList}>
                    {(rule.assets || []).map((asset) => (
                      <div
                        className={styles.deploymentRow}
                        key={`${rule.fallPercentage}-${asset.assetId}`}>
                        <strong>{asset.assetName}</strong>
                        <span>Multiplier {formatNumber(asset.multiplier)}</span>
                        <span>Min {formatNumber(asset.min)}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default UserPortfolioRebalencerOutlet;
