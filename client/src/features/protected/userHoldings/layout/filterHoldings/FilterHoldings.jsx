import { useContext, useMemo, useState } from "react";
import filterHoldingsStyles from "./filterholdings.module.css";
import Button from "../../../../../components/UI/buttons/Button";
import { AuthenticationContext } from "../../../../../context/authenticationContext";

const DEFAULT_GROUP_NAME = "NET WORTH";

const FilterHoldings = ({
  accessToken,
  errorMessage = "",
  filterHoldingData,
  isPending = false,
  onSubmitGroup,
  submitFilterHoldingData,
}) => {
  const { userData } = useContext(AuthenticationContext);
  const [groupQuery, setGroupQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [showGroupPreview, setShowGroupPreview] = useState(false);
  const [error, setError] = useState("");
  const [isGroupDirty, setIsGroupDirty] = useState(false);

  const groupOptions = useMemo(() => {
    return Object.entries(userData?.groups || {}).flatMap(([levelKey, groups]) =>
      Object.values(groups || {}).map((group) => ({
        id: group?._id || "",
        name: group?.name || "",
        level: group?.level || levelKey.replace("level", ""),
      })),
    );
  }, [userData]);

  const defaultGroup = useMemo(() => {
    return groupOptions.find(
      (group) => group.name.toUpperCase() === DEFAULT_GROUP_NAME,
    );
  }, [groupOptions]);

  const displayGroupQuery = isGroupDirty
    ? groupQuery
    : defaultGroup?.name || DEFAULT_GROUP_NAME;
  const activeSelectedGroupId = isGroupDirty
    ? selectedGroupId
    : defaultGroup?.id || "";

  const filteredGroups = useMemo(() => {
    const searchTerm = displayGroupQuery.trim().toLowerCase();
    if (!searchTerm) return groupOptions;
    return groupOptions.filter((group) =>
      group.name.toLowerCase().includes(searchTerm),
    );
  }, [displayGroupQuery, groupOptions]);

  const handleSelectGroup = (group) => {
    setIsGroupDirty(true);
    setGroupQuery(group.name);
    setSelectedGroupId(group.id);
    setShowGroupPreview(false);
    setError("");
  };

  const FilterButton = {
    id: "holdings-filter-submit",
    text: isPending ? "Submiting..." : "Submit",
    varient: "buttonBlackSquare",
    type: "submit",
    disabled: isPending,
  };

  return (
    <form
      className={filterHoldingsStyles.formContainer}
      onSubmit={(e) =>
        submitFilterHoldingData(
          e,
          filterHoldingData,
          accessToken,
          onSubmitGroup,
        )
      }>
      {(error || errorMessage) && (
        <p className={filterHoldingsStyles.error}>{error || errorMessage}</p>
      )}
      <div className={filterHoldingsStyles.groupInputContainer}>
        <label className={filterHoldingsStyles.label} htmlFor="holdingsGroup">
          Group
        </label>
        <div className={filterHoldingsStyles.inputContainer}>
          <div className={filterHoldingsStyles.inputContainerSub}>
            <input
              className={filterHoldingsStyles.input}
              type="text"
              id="holdingsGroup"
              placeholder={
                groupOptions.length ? "Search group" : "No groups found"
              }
              value={displayGroupQuery}
              onChange={(e) => {
                const nextQuery = e.target.value;
                const matchedGroup = groupOptions.find(
                  (group) =>
                    group.name.toLowerCase() === nextQuery.trim().toLowerCase(),
                );

                setIsGroupDirty(true);
                setGroupQuery(nextQuery);
                setSelectedGroupId(matchedGroup?.id || "");
                setShowGroupPreview(true);
                setError("");
              }}
              onBlur={() => {
                setTimeout(() => setShowGroupPreview(false), 200);
              }}
              onFocus={() => setShowGroupPreview(true)}
              autoComplete="off"
              required
            />
            {showGroupPreview && filteredGroups.length > 0 && (
              <div className={filterHoldingsStyles.suggestionPreview}>
                {filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    className={filterHoldingsStyles.suggestionItem}
                    type="button"
                    onMouseDown={() => handleSelectGroup(group)}>
                    <span>{group.name}</span>
                    <span className={filterHoldingsStyles.suggestionMeta}>
                      Level {group.level}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <input type="hidden" name="groupId" value={activeSelectedGroupId} />
          <Button {...FilterButton} />
        </div>
      </div>
    </form>
  );
};

export default FilterHoldings;
