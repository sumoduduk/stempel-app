import { Setter, type JSX } from "solid-js";

export type DimensionType = { w: number; h: number };
type posBase = { left: number; right: number };
export type DimPos = posBase & DimensionType;
export type DragEL = {
  children?: JSX.Element;
  scaleVal: number;
  setCoordinate: Setter<{ x: number; y: number }>;
  waterImg: string;
};

export type InvokeParamsType = {
  globalScale: number;
  coordinate: [number, number];
  wmScale: number;
  pathSrc: string;
  waterPath: string;
};
