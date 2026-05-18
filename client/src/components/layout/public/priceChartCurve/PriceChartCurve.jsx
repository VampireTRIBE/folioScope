import { useEffect, useRef } from "react";
import { AreaSeries, createChart } from "lightweight-charts"; 

import priceChartCurveStyle from "./pricechartcurve.module.css";

const PriceChartCurve = () => {
  const chartContainerRef = useRef(null);

  const data = [
    { value: 60, time: 1642425322 },
    { value: 8, time: 1642511722 },
    { value: 10, time: 1642598122 },
    { value: 20, time: 1642684522 },
    { value: 3, time: 1642770922 },
    { value: 43, time: 1642857322 },
    { value: 41, time: 1642943722 },
    { value: 43, time: 1643030122 },
    { value: 56, time: 1643116522 },
    { value: 46, time: 1643202922 },
  ];

  const isNegative = data[0].value > data[data.length - 1].value;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const styles = getComputedStyle(chartContainerRef.current);
    const textColor =
      styles.getPropertyValue("--text-primary").trim() || "black";
    const backgroundColor =
      styles.getPropertyValue("--bg-card").trim() || "white";
    const chartLineColor = isNegative
      ? styles.getPropertyValue("--chart-5").trim()
      : styles.getPropertyValue("--chart-1").trim();

    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: textColor,
        background: { type: "solid", color: backgroundColor },
      },
      autoSize: true,
      rightPriceScale: {
        scaleMargins: {
          top: 0.2,
          bottom: 0,
        },
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: chartLineColor,
      topColor: chartLineColor + "50",
      bottomColor: chartLineColor + "00",
      lineWidth: 2,

      autoscaleInfoProvider: (original) => {
        const res = original();
        if (res !== null) {
          res.priceRange.minValue = 0;
        }
        return res;
      },
    });

    areaSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div
      ref={chartContainerRef}
      className={priceChartCurveStyle.chartContainer}
    />
  );
};

export default PriceChartCurve;
