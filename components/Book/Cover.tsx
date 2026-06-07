"use client";

import { Page } from "./Page";

interface CoverProps {
  index: number;
  width: number;
  height: number;
}

export function Cover({ index, width, height }: CoverProps) {
  // The cover sheets are thicker (0.02 units vs 0.006 units for paper)
  // and are rendered using the premium leather material options
  return (
    <Page
      index={index}
      width={width}
      height={height}
      thickness={0.016}
      isCover={true}
    />
  );
}
