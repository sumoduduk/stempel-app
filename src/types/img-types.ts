import { Setter, type JSX } from "solid-js";

export type DimensionType = { w: number; h: number };
type posBase = { left: number; right: number };
export type DimPos = posBase & DimensionType;
export type DragEL = {
  children?: JSX.Element;
  scaleVal: number;
  setScaledDimension: Setter<DimensionType>;
  setCoordinate: Setter<{ x: number; y: number }>;
  baseCoor: DimPos;
  waterImg: string;
};

export type InvokeParamsType = {
  pathSrc: string;
  waterPath: string;
  wtrScaled: [number, number];
  imgDim: [number, number];
  coordinate: [number, number];
};
