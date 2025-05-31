import React, { useEffect, useRef } from "react";


function CirclePorgressChart({ title="", percentage = 75, size = 120, stroke = 10, color = '#36A2EB' }) {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage / 100);
    if (circleRef.current) {
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
      circleRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [percentage, size, stroke]);

  return (
    <div className="circle-container" style={{ width: size, height: size }}>
      <p className="chart-title">{title}</p>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - stroke) / 2 - (stroke / 2)}
          stroke="#eee"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={(size - stroke) / 2}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <p className="circle-label">{percentage}%</p>
    </div>
  );
}

export default CirclePorgressChart;
