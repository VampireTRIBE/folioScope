import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ! Hooks
import { usePublicSecurities } from "../../../../../hooks/RTK Query Hooks/sessionStorage";

// ! Utils
import {
  getSecurityId,
  getSecurityLabel,
  normalizeSecuritiesList,
} from "../../../../../utils/sessionStorage/securityListTransforms";

// ! Components
import Input from "../../../../../components/UI/inputs/Input";

// ! styles
import mobileviewsearchbarStyle from "./mobileviewsearchbar.module.css";
import buttonStyle from "../../../../../components/UI/buttons/button.module.css";

const MobileViewSearchBar = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { data, isPending, isError, error } = usePublicSecurities();

  const safeData = useMemo(() => normalizeSecuritiesList(data), [data]);

  const filteredList = useMemo(() => {
    if (!query.trim()) return [];
    return safeData.filter((item) => {
      const value = getSecurityLabel(item);
      return (value || "").toLowerCase().includes(query.toLowerCase());
    });
  }, [query, safeData]);

  const resetSearch = () => {
    setQuery("");
    setShowPreview(false);
    inputRef.current?.blur();
  };

  const navigateToSecurity = (item) => {
    const securityLabel = getSecurityLabel(item);
    if (!securityLabel) return;

    navigate(`/security/${encodeURIComponent(securityLabel)}`);
    resetSearch();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      const exactMatch = safeData.find(
        (item) => getSecurityLabel(item).toLowerCase() === query.toLowerCase(),
      );

      navigateToSecurity(exactMatch || filteredList[0] || query);
    }
  };

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className={mobileviewsearchbarStyle.mobileViewNavOption}>
      <div
        className={mobileviewsearchbarStyle.searchInput}
        style={{ position: "relative" }}>
        <Input
          ref={inputRef}
          varient="searchBar"
          id="inputSearch"
          name="inputSearch"
          placeholder={isPending ? "Loading..." : "Search for Instruments"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowPreview(true);
          }}
          onKeyDown={handleEnter}
          onBlur={() => {
            setTimeout(() => setShowPreview(false), 200);
          }}
          onFocus={() => {
            if (query.trim()) setShowPreview(true);
          }}
          autoComplete="off"
        />

        {showPreview && filteredList.length > 0 && (
          <div className={mobileviewsearchbarStyle.suggestionPreview}>
            {filteredList.map((item, index) => {
              const value = getSecurityLabel(item);
              const securityId = getSecurityId(item);

              return (
                <div
                  key={`${securityId || value}-${index}`}
                  onMouseDown={() => navigateToSecurity(item)}
                  style={{
                    padding: "var(--space-3)",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border-light)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                  }}>
                  {value}
                </div>
              );
            })}
          </div>
        )}

        <label htmlFor="inputSearch" className={buttonStyle.imgButtonInharit}>
          <img
            className={`${buttonStyle.iconInharit}`}
            src="/assets/icons/search.png"
            alt="search icon"
          />
        </label>
      </div>
    </div>
  );
};

export default MobileViewSearchBar;
