import Button from "../../../UI/buttons/Button";
import pricechartfilterStyle from "./pricechartfilter.module.css";

const PriceChartFilter = ({
  active = "W",
  action = null,
  buttonArray = [],
}) => {
  return (
    <div className={pricechartfilterStyle.container}>
      {buttonArray.map((button, indx) => (
        <Button
          key={button.id ?? indx}
          {...button}
          onClick={() => action?.(button.text.toUpperCase())}
        />
      ))}
    </div>
  );
};

export default PriceChartFilter;
