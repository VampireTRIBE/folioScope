import { useEffect, useRef } from "react";
import { LineSeries, createChart } from "lightweight-charts";

import priceChartCurveStyle from "./pricechartcurve.module.css";

const PriceChartCurveDoubleSeries = ({ data = [] }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRefs = useRef([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const styles = getComputedStyle(chartContainerRef.current);

    const textColor =
      styles.getPropertyValue("--text-primary").trim() || "black";

    const backgroundColor =
      styles.getPropertyValue("--bg-card").trim() || "white";

    const borderColor =
      styles.getPropertyValue("--border").trim() || "#e5e7eb";

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        textColor,
        background: {
          type: "solid",
          color: backgroundColor,
        },
      },

      autoSize: true,

      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          color: borderColor,
        },
      },

      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.2,
          bottom: 0.1,
        },
      },

      timeScale: {
        borderVisible: false,
      },

      crosshair: {
        mode: 1,
      },
    });

    return () => {
      seriesRefs.current.forEach((series) => {
        chartRef.current?.removeSeries(series);
      });

      seriesRefs.current = [];
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !chartContainerRef.current) return;

    const styles = getComputedStyle(chartContainerRef.current);

    const groupColor =
      styles.getPropertyValue("--chart-1").trim() || "#22c55e";

    const indexColor =
      styles.getPropertyValue("--chart-2").trim() || "#3b82f6";

    seriesRefs.current.forEach((series) => {
      chartRef.current?.removeSeries(series);
    });

    seriesRefs.current = [];

    if (!Array.isArray(data) || data.length === 0) return;

    data.forEach((seriesItem) => {
      if (!seriesItem?.data?.length) return;

      const lineColor =
        seriesItem.type === "group" ? groupColor : indexColor;

      const series = chartRef.current.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      series.setData(seriesItem.data);
      seriesRefs.current.push(series);
    });

    chartRef.current.timeScale().fitContent();
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className={priceChartCurveStyle.chartContainerTwoLines}
    />
  );
};

export default PriceChartCurveDoubleSeries;