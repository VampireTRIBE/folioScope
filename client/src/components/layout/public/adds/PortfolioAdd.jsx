import { useEffect, useState } from "react";

// ! components
import Button from "../../../UI/buttons/Button";

// ! styles
import portfolioAddStyle from "./portfolioadd.module.css";

// ! Custom Hooks
import { useNavigationActions } from "../../../../features/hooks/customHooks/useNavigationActions";

const PortfolioAdd = () => {
  const { goToLogin } = useNavigationActions();
  const [activeRadio, setActiveRadio] = useState(0);

  const buttonATTR = {
    text: "Track Your Investments",
    varient: "buttonBlackSquare",
    onClick: goToLogin,
  };
  const textArray = [
    "NAV Analysis",
    "Compare with index",
    "Compare XIRR",
    "Analyze Rolling Returns",
    "Analyze Drawdown",
  ];

  const imgSrc = [
    "assets/ads/navAnalysis.png",
    "assets/ads/navComparision.png",
    "assets/ads/xirrComparision.png",
    "IMAGE 5",
    "assets/ads/drawdownComparision.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRadio((prev) => (prev + 1) % textArray.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [textArray.length]);

  return (
    <aside className={portfolioAddStyle.addContainer}>
      <div className={portfolioAddStyle.leftContainer}>
        <div className={portfolioAddStyle.head}>
          <div className={portfolioAddStyle.text}>Connect Portfolio To</div>

          <div className={portfolioAddStyle.punchline}>
            {textArray[activeRadio]}
          </div>

          <div className={portfolioAddStyle.inputContainer}>
            {[0, 1, 2, 3, 4].map((item) => (
              <input
                className={portfolioAddStyle.radio}
                key={item}
                type="radio"
                name="portfolio-slider"
                checked={activeRadio === item}
                onChange={() => setActiveRadio(item)}
              />
            ))}
          </div>
        </div>

        <Button {...buttonATTR} />
      </div>

      <div className={portfolioAddStyle.rightContainer}>
        <img src={imgSrc[activeRadio]} alt="Ad image" />
      </div>
    </aside>
  );
};

export default PortfolioAdd;
