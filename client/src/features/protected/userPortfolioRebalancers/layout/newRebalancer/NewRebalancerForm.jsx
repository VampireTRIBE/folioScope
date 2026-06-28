import { useContext, useMemo, useState } from "react";

import { AuthenticationContext } from "../../../../../context/authenticationContext";
import { usePublicSecurities } from "../../../../../hooks/RTK Query Hooks/sessionStorage";
import {
  getSecuritiesByCategory,
  getSecurityId,
  getSecurityLabel,
  TRADABLE_SECURITIES_KEY,
} from "../../../../../utils/sessionStorage/securityListTransforms";
import { useNewRebalancerFormMutation } from "../../hooks/ReactQuery/useFormMutation";
import { useFormDataActions } from "../../hooks/customHooks/useFormData";
import styles from "./newrebalancerform.module.css";

const createAllocationRow = () => ({
  id: crypto.randomUUID(),
  assetName: "",
  assetId: "",
  groupName: "",
  groupId: "",
  weight: "",
  band: "",
  multiplier: "1",
  isCashReserve: false,
});

const createDeploymentAssetRow = () => ({
  id: crypto.randomUUID(),
  assetId: "",
  assetName: "",
  multiplier: "1",
  min: "0.15",
});

const createMarketFallRule = () => ({
  id: crypto.randomUUID(),
  fallPercentage: "",
  deployPercentage: "",
  assets: [createDeploymentAssetRow()],
});

const toNumber = (value) => Number(value || 0);

const hasDuplicateValues = (values = []) => {
  const filteredValues = values.filter(Boolean).map(String);
  return new Set(filteredValues).size !== filteredValues.length;
};

const getMutationErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "";

const NewRebalancerForm = () => {
  const { accessToken, userData } = useContext(AuthenticationContext);

  const { data: securitiesList, isPending: isPendingSecuritiesList } =
    usePublicSecurities();

  const { submitNewRebalancerFormData } = useFormDataActions();

  const {
    mutateAsync: newRebalancerFormMutationFn,
    isPending: isPendingNewRebalancerForm,
    error: newRebalancerFormError,
    reset: resetNewRebalancerFormMutation,
  } = useNewRebalancerFormMutation();

  const [allocationRows, setAllocationRows] = useState([createAllocationRow()]);
  const [marketFallRules, setMarketFallRules] = useState([
    createMarketFallRule(),
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(null);

  const mutationErrorMessage = getMutationErrorMessage(newRebalancerFormError);

  const resetMessages = () => {
    setError("");
    setSuccess("");
    resetNewRebalancerFormMutation();
  };

  const groupOptions = useMemo(() => {
    return Object.values(userData?.groups || {}).flatMap((groups) =>
      Object.values(groups || {}).map((group) => ({
        id: group?._id || group?.name,
        name: group?.name || "",
        level: group?.level,
      })),
    );
  }, [userData]);

  const leafGroupOptions = useMemo(() => {
    const groupsByLevel = Object.values(userData?.groups || {}).map((groups) =>
      Object.values(groups || {}),
    );

    const allGroups = groupsByLevel.flat();
    const leafGroups = allGroups.filter((group) => group?.isLeaf);

    if (leafGroups.length) return leafGroups;

    return [...groupsByLevel].reverse().find((groups) => groups.length) || [];
  }, [userData]);

  const tradableSecurities = useMemo(() => {
    return getSecuritiesByCategory(securitiesList, TRADABLE_SECURITIES_KEY);
  }, [securitiesList]);

  const totalWeight = allocationRows.reduce(
    (total, row) => total + toNumber(row.weight),
    0,
  );

  const selectedAllocationAssets = useMemo(() => {
    const uniqueAssets = new Map();

    allocationRows.forEach((row) => {
      if (!row.assetId || !row.assetName.trim()) return;

      uniqueAssets.set(row.assetId, {
        assetId: row.assetId,
        assetName: row.assetName.trim(),
        isCashReserve: row.isCashReserve,
      });
    });

    return Array.from(uniqueAssets.values());
  }, [allocationRows]);

  const deployableAllocationAssets = useMemo(() => {
    return selectedAllocationAssets.filter((asset) => !asset.isCashReserve);
  }, [selectedAllocationAssets]);

  const handleAllocationChange = (rowId, field, value) => {
    setAllocationRows((rows) =>
      rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );

    resetMessages();
  };

  const handleCashReserveChange = (rowId) => {
    const nextCashReserveAssetId = allocationRows.find(
      (row) => row.id === rowId,
    )?.assetId;

    setAllocationRows((rows) =>
      rows.map((row) => ({
        ...row,
        isCashReserve: row.id === rowId,
      })),
    );

    if (nextCashReserveAssetId) {
      setMarketFallRules((rules) =>
        rules.map((rule) => ({
          ...rule,
          assets: rule.assets.map((asset) =>
            asset.assetId === nextCashReserveAssetId
              ? { ...asset, assetId: "", assetName: "" }
              : asset,
          ),
        })),
      );
    }

    resetMessages();
  };

  const getFilteredSecurities = (query) => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) return tradableSecurities;

    return tradableSecurities.filter((item) =>
      getSecurityLabel(item).toLowerCase().includes(searchTerm),
    );
  };

  const getFilteredLeafGroups = (query) => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) return leafGroupOptions;

    return leafGroupOptions.filter((group) =>
      group?.name?.toLowerCase().includes(searchTerm),
    );
  };

  const selectAsset = (rowId, asset) => {
    setAllocationRows((rows) =>
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              assetName: getSecurityLabel(asset),
              assetId: getSecurityId(asset),
            }
          : row,
      ),
    );

    setActiveSuggestion(null);
    resetMessages();
  };

  const selectLeafGroup = (rowId, group) => {
    setAllocationRows((rows) =>
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              groupName: group?.name || "",
              groupId: group?._id || "",
            }
          : row,
      ),
    );

    setActiveSuggestion(null);
    resetMessages();
  };

  const addAllocationRow = () => {
    setAllocationRows((rows) => [...rows, createAllocationRow()]);
    resetMessages();
  };

  const removeAllocationRow = (rowId) => {
    setAllocationRows((rows) => {
      if (rows.length === 1) return rows;
      return rows.filter((row) => row.id !== rowId);
    });

    resetMessages();
  };

  const handleMarketFallRuleChange = (ruleIndex, field, value) => {
    setMarketFallRules((rules) =>
      rules.map((rule, index) =>
        index === ruleIndex ? { ...rule, [field]: value } : rule,
      ),
    );

    resetMessages();
  };

  const handleMarketFallAssetRuleChange = (
    ruleIndex,
    assetIndex,
    field,
    value,
  ) => {
    setMarketFallRules((rules) =>
      rules.map((rule, index) =>
        index === ruleIndex
          ? {
              ...rule,
              assets: rule.assets.map((asset, currentAssetIndex) =>
                currentAssetIndex === assetIndex
                  ? { ...asset, [field]: value }
                  : asset,
              ),
            }
          : rule,
      ),
    );

    resetMessages();
  };

  const selectMarketFallAsset = (ruleIndex, assetIndex, assetId) => {
    const selectedAsset = deployableAllocationAssets.find(
      (asset) => asset.assetId === assetId,
    );

    setMarketFallRules((rules) =>
      rules.map((rule, index) =>
        index === ruleIndex
          ? {
              ...rule,
              assets: rule.assets.map((asset, currentAssetIndex) =>
                currentAssetIndex === assetIndex
                  ? {
                      ...asset,
                      assetId: selectedAsset?.assetId || "",
                      assetName: selectedAsset?.assetName || "",
                    }
                  : asset,
              ),
            }
          : rule,
      ),
    );

    resetMessages();
  };

  const addMarketFallRule = () => {
    setMarketFallRules((rules) => [...rules, createMarketFallRule()]);
    resetMessages();
  };

  const removeMarketFallRule = (ruleId) => {
    setMarketFallRules((rules) => {
      if (rules.length === 1) return rules;
      return rules.filter((rule) => rule.id !== ruleId);
    });

    resetMessages();
  };

  const addMarketFallAssetRule = (ruleIndex) => {
    setMarketFallRules((rules) =>
      rules.map((rule, index) =>
        index === ruleIndex
          ? { ...rule, assets: [...rule.assets, createDeploymentAssetRow()] }
          : rule,
      ),
    );

    resetMessages();
  };

  const removeMarketFallAssetRule = (ruleIndex, assetRowId) => {
    setMarketFallRules((rules) =>
      rules.map((rule, index) =>
        index === ruleIndex
          ? {
              ...rule,
              assets:
                rule.assets.length === 1
                  ? rule.assets
                  : rule.assets.filter((asset) => asset.id !== assetRowId),
            }
          : rule,
      ),
    );

    resetMessages();
  };

  const handleReset = () => {
    setAllocationRows([createAllocationRow()]);
    setMarketFallRules([createMarketFallRule()]);
    setError("");
    setSuccess("");
    resetNewRebalancerFormMutation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    setError("");
    setSuccess("");

    if (!values.portfolioGroupId) {
      setError("Portfolio group is required.");
      return;
    }

    if (!values.sipAmount || toNumber(values.sipAmount) < 1000) {
      setError("SIP amount must be at least 1000.");
      return;
    }

    if (Math.abs(totalWeight - 100) > 0.01) {
      setError("Total target weight must be exactly 100%.");
      return;
    }

    const hasIncompleteAllocation = allocationRows.some(
      (row) =>
        !row.assetName.trim() ||
        !row.assetId ||
        !row.groupName.trim() ||
        !row.groupId ||
        row.weight === "" ||
        row.band === "",
    );

    if (hasIncompleteAllocation) {
      setError(
        "Select asset and leaf group suggestions for every allocation row.",
      );
      return;
    }

    const allocationAssetIdsArray = allocationRows.map((row) => row.assetId);
    const allocationGroupIdsArray = allocationRows.map((row) => row.groupId);

    if (hasDuplicateValues(allocationAssetIdsArray)) {
      setError("Duplicate assets are not allowed in allocation rules.");
      return;
    }

    if (hasDuplicateValues(allocationGroupIdsArray)) {
      setError("Duplicate groups are not allowed in allocation rules.");
      return;
    }

    const cashReserveCount = allocationRows.filter(
      (row) => row.isCashReserve,
    ).length;

    if (cashReserveCount !== 1) {
      setError("Select exactly one allocation asset as cash reserve.");
      return;
    }

    const allocationAssetIds = new Set(allocationAssetIdsArray);
    const cashReserveAssetIds = new Set(
      allocationRows
        .filter((row) => row.isCashReserve)
        .map((row) => row.assetId)
        .filter(Boolean),
    );

    const hasIncompleteDeploymentRule = marketFallRules.some(
      (rule) =>
        rule.fallPercentage === "" ||
        rule.deployPercentage === "" ||
        !rule.assets.length ||
        rule.assets.some(
          (asset) => !asset.assetId || !allocationAssetIds.has(asset.assetId),
        ),
    );

    if (hasIncompleteDeploymentRule) {
      setError(
        "Add market fall %, deploy %, and choose valid non-cash allocation assets for every deployment rule.",
      );
      return;
    }

    const hasCashReserveDeploymentAsset = marketFallRules.some((rule) =>
      rule.assets.some((asset) => cashReserveAssetIds.has(asset.assetId)),
    );

    if (hasCashReserveDeploymentAsset) {
      setError("Cash reserve assets cannot be selected in market fall rules.");
      return;
    }

    const hasIncompleteDeploymentNumbers = marketFallRules.some((rule) =>
      rule.assets.some((asset) => asset.multiplier === "" || asset.min === ""),
    );

    if (hasIncompleteDeploymentNumbers) {
      setError("Multiplier and min are required for every deployment asset.");
      return;
    }

    const hasInvalidDeploymentMin = marketFallRules.some((rule) =>
      rule.assets.some((asset) => toNumber(asset.min) < 0.15),
    );

    if (hasInvalidDeploymentMin) {
      setError("Market fall asset min must be at least 0.15.");
      return;
    }

    const hasDuplicateFallPercentage = hasDuplicateValues(
      marketFallRules.map((rule) => rule.fallPercentage),
    );

    if (hasDuplicateFallPercentage) {
      setError("Duplicate market fall percentages are not allowed.");
      return;
    }

    const hasDuplicateDeploymentAsset = marketFallRules.some((rule) =>
      hasDuplicateValues(rule.assets.map((asset) => asset.assetId)),
    );

    if (hasDuplicateDeploymentAsset) {
      setError("Same asset cannot be repeated inside one market fall rule.");
      return;
    }

    const assets = allocationRows.map((row) => ({
      assetId: row.assetId,
      groupId: row.groupId,
      targetWeight: toNumber(row.weight),
      band: toNumber(row.band),
      multiplier: toNumber(row.multiplier || 1),
      isCashReserve: row.isCashReserve,
    }));

    const normalizedMarketFallRules = marketFallRules.map((rule) => ({
      fallPercentage: toNumber(rule.fallPercentage),
      deployPercentage: toNumber(rule.deployPercentage),
      assets: rule.assets.map((asset) => ({
        assetId: asset.assetId,
        multiplier: toNumber(asset.multiplier || 1),
        min: toNumber(asset.min || 0.15),
      })),
    }));

    const response = await submitNewRebalancerFormData(
      e,
      newRebalancerFormMutationFn,
      accessToken,
      assets,
      normalizedMarketFallRules,
    );

    if (response) {
      setSuccess(
        response?.message || `${values.rebalancerName} rebalancer created.`,
      );
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} onReset={handleReset}>
      <fieldset
        className={styles.fieldset}
        disabled={isPendingNewRebalancerForm}>
        <legend className={styles.legend}>
          <div>
            <h3>Create New Rebalancer</h3>
            <p>Set target weights, drift bands, and deployment rules.</p>
          </div>

          <div className={styles.weightBadge}>
            Total Weight <strong>{totalWeight.toFixed(2)}%</strong>
          </div>
        </legend>

        {(error || mutationErrorMessage) && (
          <div className={styles.error}>{error || mutationErrorMessage}</div>
        )}

        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Rebalancer Details</h4>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="portfolioGroupId" className={styles.label}>
                Portfolio Group
              </label>

              <select
                className={styles.input}
                id="portfolioGroupId"
                name="portfolioGroupId"
                required
                onChange={resetMessages}>
                <option value="">Select group</option>

                {groupOptions.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} {group.level ? `(Level ${group.level})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="sipAmount" className={styles.label}>
                SIP Amount
              </label>

              <input
                className={styles.input}
                type="number"
                min="1000"
                step="1"
                placeholder="15000"
                id="sipAmount"
                name="sipAmount"
                onChange={resetMessages}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="rebalancerName" className={styles.label}>
                Rebalancer Name
              </label>

              <input
                className={styles.input}
                type="text"
                placeholder="Core ETF Rebalancer"
                id="rebalancerName"
                name="rebalancerName"
                minLength="2"
                maxLength="100"
                onChange={resetMessages}
                required
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label htmlFor="rebalancerDescription" className={styles.label}>
                Rebalancer Description
              </label>

              <textarea
                className={styles.textarea}
                placeholder="Describe the strategy, risk limits, or SIP rule."
                id="rebalancerDescription"
                name="rebalancerDescription"
                rows="3"
                maxLength="500"
                onChange={resetMessages}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Allocation Rules</h4>

            <button
              className={styles.secondaryButton}
              type="button"
              onClick={addAllocationRow}>
              Add Rule
            </button>
          </div>

          <div className={styles.allocations}>
            {allocationRows.map((row, index) => (
              <div className={styles.allocationRow} key={row.id}>
                <div className={styles.rowHeader}>
                  <strong>Rule {index + 1}</strong>

                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={() => removeAllocationRow(row.id)}
                    disabled={allocationRows.length === 1}>
                    Remove
                  </button>
                </div>

                <div className={styles.allocationGrid}>
                  <div className={styles.inputGroup}>
                    <label
                      htmlFor={`assetName-${row.id}`}
                      className={styles.label}>
                      Asset Name
                    </label>

                    <div className={styles.suggestionContainer}>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder={
                          isPendingSecuritiesList
                            ? "Loading..."
                            : "Select asset"
                        }
                        id={`assetName-${row.id}`}
                        value={row.assetName}
                        onChange={(e) => {
                          const nextQuery = e.target.value;

                          const matchedAsset = tradableSecurities.find(
                            (asset) =>
                              getSecurityLabel(asset).toLowerCase() ===
                              nextQuery.trim().toLowerCase(),
                          );

                          handleAllocationChange(
                            row.id,
                            "assetName",
                            nextQuery,
                          );

                          handleAllocationChange(
                            row.id,
                            "assetId",
                            matchedAsset ? getSecurityId(matchedAsset) : "",
                          );

                          setActiveSuggestion({
                            rowId: row.id,
                            field: "assetName",
                          });
                        }}
                        onBlur={() => {
                          setTimeout(() => setActiveSuggestion(null), 200);
                        }}
                        onFocus={() =>
                          setActiveSuggestion({
                            rowId: row.id,
                            field: "assetName",
                          })
                        }
                        autoComplete="off"
                        required
                      />

                      {activeSuggestion?.rowId === row.id &&
                        activeSuggestion?.field === "assetName" &&
                        getFilteredSecurities(row.assetName).length > 0 && (
                          <div className={styles.suggestionPreview}>
                            {getFilteredSecurities(row.assetName).map(
                              (asset, assetIndex) => {
                                const label = getSecurityLabel(asset);
                                const id = getSecurityId(asset);

                                return (
                                  <button
                                    className={styles.suggestionItem}
                                    key={`${id || label}-${assetIndex}`}
                                    type="button"
                                    onMouseDown={() =>
                                      selectAsset(row.id, asset)
                                    }>
                                    <span>{label}</span>
                                  </button>
                                );
                              },
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label
                      htmlFor={`groupName-${row.id}`}
                      className={styles.label}>
                      Leaf Group
                    </label>

                    <div className={styles.suggestionContainer}>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="Select leaf group"
                        id={`groupName-${row.id}`}
                        value={row.groupName}
                        onChange={(e) => {
                          const nextQuery = e.target.value;

                          const matchedGroup = leafGroupOptions.find(
                            (group) =>
                              group?.name?.toLowerCase() ===
                              nextQuery.trim().toLowerCase(),
                          );

                          handleAllocationChange(
                            row.id,
                            "groupName",
                            nextQuery,
                          );

                          handleAllocationChange(
                            row.id,
                            "groupId",
                            matchedGroup?._id || "",
                          );

                          setActiveSuggestion({
                            rowId: row.id,
                            field: "groupName",
                          });
                        }}
                        onBlur={() => {
                          setTimeout(() => setActiveSuggestion(null), 200);
                        }}
                        onFocus={() =>
                          setActiveSuggestion({
                            rowId: row.id,
                            field: "groupName",
                          })
                        }
                        autoComplete="off"
                        required
                      />

                      {activeSuggestion?.rowId === row.id &&
                        activeSuggestion?.field === "groupName" &&
                        getFilteredLeafGroups(row.groupName).length > 0 && (
                          <div className={styles.suggestionPreview}>
                            {getFilteredLeafGroups(row.groupName).map(
                              (group) => (
                                <button
                                  className={styles.suggestionItem}
                                  key={group?._id || group?.name}
                                  type="button"
                                  onMouseDown={() =>
                                    selectLeafGroup(row.id, group)
                                  }>
                                  <span>{group?.name}</span>
                                  <span className={styles.suggestionMeta}>
                                    Level {group?.level}
                                  </span>
                                </button>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label
                      htmlFor={`weight-${row.id}`}
                      className={styles.label}>
                      Weight %
                    </label>

                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="20"
                      id={`weight-${row.id}`}
                      value={row.weight}
                      onChange={(e) =>
                        handleAllocationChange(row.id, "weight", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor={`band-${row.id}`} className={styles.label}>
                      Band %
                    </label>

                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="3"
                      id={`band-${row.id}`}
                      value={row.band}
                      onChange={(e) =>
                        handleAllocationChange(row.id, "band", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label
                      htmlFor={`multiplier-${row.id}`}
                      className={styles.label}>
                      Multiplier
                    </label>

                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      step="0.05"
                      placeholder="1"
                      id={`multiplier-${row.id}`}
                      value={row.multiplier}
                      onChange={(e) =>
                        handleAllocationChange(
                          row.id,
                          "multiplier",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <label
                    className={`${styles.cashReserveOption} ${
                      row.isCashReserve ? styles.cashReserveSelected : ""
                    }`}
                    htmlFor={`cashReserve-${row.id}`}>
                    <input
                      type="radio"
                      id={`cashReserve-${row.id}`}
                      name="cashReserveAsset"
                      checked={row.isCashReserve}
                      onChange={() => handleCashReserveChange(row.id)}
                      required
                    />
                    <span>Cash Reserve</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Market Fall Deployment</h4>

            <button
              className={styles.secondaryButton}
              type="button"
              onClick={addMarketFallRule}>
              Add Rule
            </button>
          </div>

          <div className={styles.allocations}>
            {marketFallRules.map((rule, ruleIndex) => (
              <div className={styles.allocationRow} key={rule.id}>
                <div className={styles.rowHeader}>
                  <strong>Deployment Rule {ruleIndex + 1}</strong>

                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={() => removeMarketFallRule(rule.id)}
                    disabled={marketFallRules.length === 1}>
                    Remove
                  </button>
                </div>

                <div className={styles.marketFallMetaRow}>
                  <div className={styles.marketFallInlineField}>
                    <label
                      className={styles.inlineLabel}
                      htmlFor={`marketFall-${rule.id}`}>
                      Market Fall %
                    </label>

                    <input
                      className={styles.compactInput}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="10"
                      id={`marketFall-${rule.id}`}
                      value={rule.fallPercentage}
                      onChange={(e) =>
                        handleMarketFallRuleChange(
                          ruleIndex,
                          "fallPercentage",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>

                  <div className={styles.marketFallInlineField}>
                    <label
                      className={styles.inlineLabel}
                      htmlFor={`deployPercentage-${rule.id}`}>
                      Deploy %
                    </label>

                    <input
                      className={styles.compactInput}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="20"
                      id={`deployPercentage-${rule.id}`}
                      value={rule.deployPercentage}
                      onChange={(e) =>
                        handleMarketFallRuleChange(
                          ruleIndex,
                          "deployPercentage",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className={styles.deploymentAssets}>
                  <div className={styles.sectionHeader}>
                    <strong className={styles.subsectionTitle}>Assets</strong>

                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => addMarketFallAssetRule(ruleIndex)}
                      disabled={!deployableAllocationAssets.length}>
                      Add Asset
                    </button>
                  </div>

                  {rule.assets.map((asset, assetIndex) => (
                    <div className={styles.deploymentAssetGrid} key={asset.id}>
                      <div className={styles.inputGroup}>
                        <label
                          className={styles.label}
                          htmlFor={`deploymentAsset-${rule.id}-${asset.id}`}>
                          Asset
                        </label>

                        <select
                          className={styles.input}
                          id={`deploymentAsset-${rule.id}-${asset.id}`}
                          value={asset.assetId}
                          onChange={(e) =>
                            selectMarketFallAsset(
                              ruleIndex,
                              assetIndex,
                              e.target.value,
                            )
                          }
                          required>
                          <option value="">
                            {deployableAllocationAssets.length
                              ? "Select allocation asset"
                              : "Select non-cash allocation assets first"}
                          </option>

                          {deployableAllocationAssets.map((allocationAsset) => (
                            <option
                              key={allocationAsset.assetId}
                              value={allocationAsset.assetId}>
                              {allocationAsset.assetName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label
                          className={styles.label}
                          htmlFor={`deploymentMultiplier-${rule.id}-${asset.id}`}>
                          Multiplier
                        </label>

                        <input
                          className={styles.input}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="1.5"
                          id={`deploymentMultiplier-${rule.id}-${asset.id}`}
                          value={asset.multiplier}
                          onChange={(e) =>
                            handleMarketFallAssetRuleChange(
                              ruleIndex,
                              assetIndex,
                              "multiplier",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label
                          className={styles.label}
                          htmlFor={`deploymentMin-${rule.id}-${asset.id}`}>
                          Min
                        </label>

                        <input
                          className={styles.input}
                          type="number"
                          min="0.15"
                          step="0.01"
                          placeholder="0.15"
                          id={`deploymentMin-${rule.id}-${asset.id}`}
                          value={asset.min}
                          onChange={(e) =>
                            handleMarketFallAssetRuleChange(
                              ruleIndex,
                              assetIndex,
                              "min",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>

                      <button
                        className={styles.removeButton}
                        type="button"
                        onClick={() =>
                          removeMarketFallAssetRule(ruleIndex, asset.id)
                        }
                        disabled={rule.assets.length === 1}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button className={styles.resetButton} type="reset">
            Reset
          </button>

          <button className={styles.submitButton} type="submit">
            {isPendingNewRebalancerForm ? "Creating..." : "Create Rebalancer"}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default NewRebalancerForm;
