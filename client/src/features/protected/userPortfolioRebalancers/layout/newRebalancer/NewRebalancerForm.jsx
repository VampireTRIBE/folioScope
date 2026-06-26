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
});

const toNumber = (value) => Number(value || 0);

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const mutationErrorMessage = getMutationErrorMessage(newRebalancerFormError);

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

  const handleAllocationChange = (rowId, field, value) => {
    setAllocationRows((rows) =>
      rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
    setError("");
    setSuccess("");
    resetNewRebalancerFormMutation();
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
    setError("");
    setSuccess("");
    resetNewRebalancerFormMutation();
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
    setError("");
    setSuccess("");
    resetNewRebalancerFormMutation();
  };

  const addAllocationRow = () => {
    setAllocationRows((rows) => [...rows, createAllocationRow()]);
    setError("");
    setSuccess("");
    resetNewRebalancerFormMutation();
  };

  const removeAllocationRow = (rowId) => {
    setAllocationRows((rows) => {
      if (rows.length === 1) return rows;
      return rows.filter((row) => row.id !== rowId);
    });
    setError("");
    setSuccess("");
    resetNewRebalancerFormMutation();
  };

  const handleReset = () => {
    setAllocationRows([createAllocationRow()]);
    setError("");
    setSuccess("");
    resetNewRebalancerFormMutation();
  };

  const handleSubmit = async (e) => {
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    setError("");
    setSuccess("");

    if (Math.abs(totalWeight - 100) > 0.01) {
      e.preventDefault();
      setError("Total target weight must be 100%.");
      return;
    }

    const assets = allocationRows.map((row) => ({
      assetId: row.assetId,
      groupId: row.groupId,
      assetName: row.assetName.trim(),
      groupName: row.groupName.trim(),
      targetWeight: toNumber(row.weight),
      band: toNumber(row.band),
      multiplier: toNumber(row.multiplier || 1),
    }));

    const hasIncompleteAllocation = assets.some(
      (row) =>
        !row.assetName ||
        !row.assetId ||
        !row.groupName ||
        !row.groupId ||
        !row.targetWeight ||
        !row.band,
    );

    if (hasIncompleteAllocation) {
      e.preventDefault();
      setError(
        "Select asset and leaf group suggestions for every allocation row.",
      );
      return;
    }

    const response = await submitNewRebalancerFormData(
      e,
      newRebalancerFormMutationFn,
      accessToken,
      assets,
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
            <p>Set target weights, drift bands and SIP multipliers.</p>
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
              <label htmlFor="groupId" className={styles.label}>
                Group
              </label>
              <select
                className={styles.input}
                id="groupId"
                name="groupId"
                required
                onChange={() => {
                  setError("");
                  setSuccess("");
                  resetNewRebalancerFormMutation();
                }}>
                <option value="">Select group</option>
                {groupOptions.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} {group.level ? `(Level ${group.level})` : ""}
                  </option>
                ))}
              </select>
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
                onChange={() => {
                  setError("");
                  setSuccess("");
                  resetNewRebalancerFormMutation();
                }}
                required
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label htmlFor="rebalancerDescription" className={styles.label}>
                Rebalancer Description
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Describe the strategy, risk limits or SIP rule."
                id="rebalancerDescription"
                name="rebalancerDescription"
                rows="3"
                onChange={() => {
                  setError("");
                  setSuccess("");
                  resetNewRebalancerFormMutation();
                }}
                required
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
                            : "Select Assets"
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

                                return (
                                  <button
                                    className={styles.suggestionItem}
                                    key={`${getSecurityId(asset) || label}-${assetIndex}`}
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
                      Group Name
                    </label>
                    <div className={styles.suggestionContainer}>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="Leaf group"
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
