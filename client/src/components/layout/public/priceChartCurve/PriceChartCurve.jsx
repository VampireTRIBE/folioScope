import { useEffect, useRef } from "react";

import { AreaSeries, createChart } from "lightweight-charts";

import priceChartCurveStyle from "./pricechartcurve.module.css";

const PriceChartCurve = ({ data = [] }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const styles = getComputedStyle(chartContainerRef.current);

    const textColor =
      styles.getPropertyValue("--text-primary").trim() || "black";

    const backgroundColor =
      styles.getPropertyValue("--bg-card").trim() || "white";

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        textColor,

        background: {
          type: "solid",
          color: backgroundColor,
        },
      },

      autoSize: true,

      rightPriceScale: {
        scaleMargins: {
          top: 0.2,
          bottom: 0,
        },
      },
    });

    seriesRef.current = chartRef.current.addSeries(AreaSeries, {
      lineWidth: 2,
    });

    return () => {
      chartRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (!data.length) return seriesRef.current.setData(data);
    const styles = getComputedStyle(chartContainerRef.current);

    const isNegative = data[0]?.value > data[data.length - 1]?.value;

    const chartLineColor = isNegative
      ? styles.getPropertyValue("--chart-5").trim()
      : styles.getPropertyValue("--chart-1").trim();

    seriesRef.current.applyOptions({
      lineColor: chartLineColor,
      topColor: chartLineColor + "50",
      bottomColor: chartLineColor + "00",
    });

    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className={priceChartCurveStyle.chartContainer}
    />
  );
};

export default PriceChartCurve;
