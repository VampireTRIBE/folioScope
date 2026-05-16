import Button from "../../../UI/buttons/Button";
import pricechartfilterStyle from "./pricechartfilter.module.css";

const PriceChartFilter = () => {
  const arr = [
    {
      id: "Week",
      text: "W",
      varient: "chartFilterActive",
    },
    {
      id: "Month",
      text: "M",
      varient: "chartFilter",
    },
    {
      id: "Year",
      text: "Y",
      varient: "chartFilter",
    },
    {
      id: "3Year",
      text: "3Y",
      varient: "chartFilter",
    },
    {
      id: "Max",
      text: "Max",
      varient: "chartFilter",
    },
  ];
  return (
    <div className={pricechartfilterStyle.container}>
      {arr.map((button, indx) => (
        <Button key={button.id ?? indx} {...button} />
      ))}
    </div>
  );
};

export default PriceChartFilter;
