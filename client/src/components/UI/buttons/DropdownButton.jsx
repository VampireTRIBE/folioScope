import { useEffect, useRef, useState } from "react";
import buttonStyle from "./button.module.css";

const DropdownButton = ({
  variant,
  children,
  items = [],
  wrapperVariant = "sideDropdownWrapper",
  menuVariant = "sideDropdownMenu",
  itemVariant = "sideDropdownItem",
  emptyLabel = "No items",
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className={buttonStyle[wrapperVariant]} ref={dropdownRef}>
      <button
        type="button"
        className={buttonStyle[variant]}
        onClick={toggleDropdown}
        {...rest}>
        <span>{children}</span>
        <span className={buttonStyle.dropdownArrow}>{open ? "^" : "v"}</span>
      </button>

      {open && (
        <div className={buttonStyle[menuVariant]}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <button
                key={item.id || index}
                type="button"
                className={buttonStyle[item.variant || itemVariant]}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}>
                {item.children || item.label || item.name}
              </button>
            ))
          ) : (
            <span className={buttonStyle[itemVariant]}>{emptyLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
