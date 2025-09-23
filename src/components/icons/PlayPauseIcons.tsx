import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

export const PlayIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  className = ""
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
      fill="none"
      stroke="#333"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M20 24V17.0718L26 20.5359L32 24L26 27.4641L20 30.9282V24Z"
      fill="none"
      stroke="#333"
      strokeWidth="4"
      strokeLinejoin="round"
    />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  className = ""
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
      fill="none"
      stroke="#333"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M19 18V30"
      stroke="#333"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M29 18V30"
      stroke="#333"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);