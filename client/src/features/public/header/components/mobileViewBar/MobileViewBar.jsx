import React, { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FETCH_SECURITIESLIST } from "../../api/fetchApis";

import Input from "../../../../../components/UI/inputs/Input";

import containerStyle from "../../../../../styles/containerStyles/container.module.css";
import componentStyle from "../../../../../styles/componetsStyles/component.module.css";
import buttonStyle from "../../../../../styles/singleStyles/button.module.css";

const MobileViewBar = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["securitieslist"],
    queryFn: FETCH_SECURITIESLIST,
    staleTime: 600000,
  });

  const safeData = Array.isArray(data) ? data : [];

  const filteredList = useMemo(() => {
    if (!query.trim()) return [];
    return safeData.filter((item) => {
      const value = typeof item === "string" ? item : item?.name;
      return (value || "").toLowerCase().includes(query.toLowerCase());
    });
  }, [query, safeData]);

  const resetSearch = () => {
    setQuery("");
    setShowPreview(false);
    inputRef.current?.blur();
  };

  const navigateToSecurity = (value) => {
    navigate(`/security/${value}`);
    resetSearch();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      navigateToSecurity(query);
    }
  };

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className={`flex ${containerStyle.mobileViewNavOption}`}>
      <div
        className={`flex ${componentStyle.searchInput}`}
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
          <div className={componentStyle.suggestionPreview}>
            {filteredList.map((item, index) => {
              const value = typeof item === "string" ? item : item?.name;

              return (
                <div
                  key={index}
                  onMouseDown={() => navigateToSecurity(value)}
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

        <label
          htmlFor="inputSearch"
          className={`flex ${buttonStyle.imgButtonInharit}`}>
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

export default MobileViewBar;
