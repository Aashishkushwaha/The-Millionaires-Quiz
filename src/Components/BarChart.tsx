import React from "react";
import { BarType } from "../types";
import "../styles/BarChart.css";

type BarChartProps = {
  data: BarType[];
};

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  let maxScore = Math.max(...data.map((item: BarType) => item.score));

  return (
    <div className="chart__container">
      <span className="x-axis"></span>
      <span className="y-axis"></span>
      {data.map((item: BarType, index: number) => (
        <div
          key={item.label}
          className="column"
          style={{
            height: `${(item.score / maxScore) * 100 * 2}px`,
            left: `${(100 / (data.length + 0.95)) * (index + 1)}%`,
          }}
        >
          <span className="score">{item.score}%</span>
          <span className="label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
