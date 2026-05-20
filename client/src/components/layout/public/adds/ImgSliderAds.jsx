import React, { useEffect, useState } from "react";
import imgSliderAdStyle from "./imgsliderads.module.css";

const ImgSliderAds = () => {
  const [activeRadio, setActiveRadio] = useState(0);

  const imgSrc = ["IMAGE 1", "IMAGE 2", "IMAGE 3", "IMAGE 4", "IMAGE 5"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRadio((prev) => (prev + 1) % imgSrc.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [imgSrc.length]);

  return (
    <div className={imgSliderAdStyle.container}>
      <div className={imgSliderAdStyle.img}>{imgSrc[activeRadio]}</div>
      <div className={imgSliderAdStyle.inputContainer}>
        {[0, 1, 2, 3, 4].map((item) => (
          <input
            className={imgSliderAdStyle.radio}
            key={item}
            type="radio"
            name="imgAds-slider"
            checked={activeRadio === item}
            onChange={() => setActiveRadio(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(ImgSliderAds);
