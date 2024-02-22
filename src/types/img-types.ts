import { Setter, type JSX } from "solid-js";

export type DimensionType = { w: number; h: number };
export type DragEL = {
  children?: JSX.Element;
  scaleVal: number;
  setScaledDimension: Setter<DimensionType>;
  setCoordinate: Setter<{ x: number; y: number }>;
  waterImg: string;
  coordinateBase: { bx: number; by: number };
};

export type InvokeParamsType = {
  pathSrc: string;
  waterPath: string;
  wtrScaled: [number, number];
  imgDim: [number, number];
  coordinate: [number, number];
};
