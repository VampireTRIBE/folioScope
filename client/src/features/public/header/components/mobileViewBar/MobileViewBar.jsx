import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import containerStyle from "../../../../../styles/containerStyles/container.module.css";
import componentStyle from "../../../../../styles/componetsStyles/component.module.css";
import buttonStyle from "../../../../../styles/singleStyles/button.module.css";
import Input from "../../../../../components/UI/inputs/Input";
import { FETCH_SECURITIESLIST } from "../../api/fetchApis";

const MobileViewBar = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [securitieslist, setSecuritieslist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSecurities = async () => {
      try {
        setLoading(true);
        const data = await FETCH_SECURITIESLIST();
        setSecuritieslist(data || []);
      } catch (error) {
        console.error("FETCH_SECURITIESLIST ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSecurities();
  }, []);

  const filteredList = useMemo(() => {
    if (!query.trim()) return [];
    return securitieslist.filter((item) => {
      const value = typeof item === "string" ? item : item.name;
      return value.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, securitieslist]);

  const resetSearch = () => {
    setQuery("");
    setShowPreview(false);
    inputRef.current?.blur();
  };

  const navigateToSecurity = (value) => {
    navigate(`/security/${value}`);
    resetSearch();
  };

  const handleSelect = (value) => {
    navigateToSecurity(value);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      navigateToSecurity(query);
    }
  };

  return (
    <div className={`flex ${containerStyle.mobileViewNavOption}`}>
      <div
        className={`flex ${componentStyle.searchInput}`}
        style={{
          position: "relative",
        }}>
        <Input
          ref={inputRef}
          varient={"searchBar"}
          id={"inputSearch"}
          name={"inputSearch"}
          placeholder={loading ? "Loading..." : "Search for Insturments"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowPreview(true);
          }}
          onKeyDown={handleEnter}
          onBlur={() => {
            setTimeout(() => {
              setShowPreview(false);
            }, 200);
          }}
          onFocus={() => {
            if (query.trim()) {
              setShowPreview(true);
            }
          }}
          autoComplete="off"
        />

        {showPreview && filteredList.length > 0 && (
          <div className={componentStyle.suggestionPreview}>
            {filteredList.map((item, index) => {
              const value = typeof item === "string" ? item : item.name;

              return (
                <div
                  key={index}
                  onMouseDown={() => handleSelect(value)}
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
            title="search icon"
          />
        </label>
      </div>
    </div>
  );
};

export default MobileViewBar;
