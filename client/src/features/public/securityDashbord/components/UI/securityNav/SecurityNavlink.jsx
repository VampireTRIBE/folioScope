import Button from "../../../../../../components/UI/buttons/Button";
import securityNavlinkStyle from "./securitynavlink.module.css";

const SecurityNavlink = () => {
  const buttonArray = [
    {
      id: "overview",
      text: "Overview",
      varient: "navlinkButton",
    },
    {
      id: "Analysis",
      text: "Analysis",
      varient: "navlinkButton",
    },
    {
      id: "Comparision",
      text: "Comparision",
      varient: "navlinkButton",
    },
  ];
  return (
    <div className={securityNavlinkStyle.navlinkContainer}>
      {buttonArray.map((button, indx) => (
        <Button key={button?.id ?? indx} {...button} />
      ))}
    </div>
  );
};

export default SecurityNavlink;
