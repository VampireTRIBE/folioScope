import { useEffect, useRef, useState } from "react";
import buttonStyle from "./button.module.css";

const DropdownButton = ({
  variant,
  children,
  items = [],
  menuVariant = "sideDropdownMenu",
  itemVariant = "sideDropdownItem",
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
    <div className={buttonStyle.sideDropdownWrapper} ref={dropdownRef}>
      <button
        type="button"
        className={buttonStyle[variant]}
        onClick={toggleDropdown}
        {...rest}>
        <span>{children}</span>
        <span className={buttonStyle.dropdownArrow}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className={buttonStyle[menuVariant]}>
          {items.map((item, index) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
