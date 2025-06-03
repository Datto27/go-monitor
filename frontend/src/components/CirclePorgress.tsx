import React from "react";

const CircularProgress = ({ percentage = 0, size = 120, strokeWidth = 10, color = "#3b82f6", label = '', value = '', unit = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={'circularProgressContainer'}>
      <div style={{width: size, height: size }} className={'circularProgressWrapper'}>
        <svg width={size} height={size} className={'circularProgressSvg'}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={'progressCircle'}
          />
        </svg>
        <div className={'progressText'}>
          <div className={'progressPercentage'}>{percentage.toFixed(1)}%</div>
          <div className={'progressValue'}>{value}{unit}</div>
        </div>
      </div>
      <div className={'progressLabel'}>{label}</div>
    </div>
  );
};

export default CircularProgress;
