import { createRoot, createSignal } from "solid-js";

type BaseDimensionT = {
  wbase: number;
  hbase: number;
};

type BaseNaturalT = {
  wbn: number;
  hbn: number;
};

type BasePositionT = {
  l: number;
  r: number;
  t: number;
  b: number;
};

function createBaseState() {
  const [baseScale, setBaseScale] = createSignal<number>(1);

  const [baseDimensionNatural, setBaseDimensionNatural] =
    createSignal<BaseNaturalT>({
      wbn: 0,
      hbn: 0,
    });

  const [baseDimensionScaled, setBaseDimensionScaled] =
    createSignal<BaseDimensionT>({
      wbase: 0,
      hbase: 0,
    });

  const [basePosition, setBasePosition] = createSignal<BasePositionT>({
    l: 0,
    r: 0,
    t: 0,
    b: 0,
  });

  return {
    baseScale,
    setBaseScale,
    baseDimensionNatural,
    setBaseDimensionNatural,
    baseDimensionScaled,
    setBaseDimensionScaled,
    basePosition,
    setBasePosition,
  };
}

export default createRoot(createBaseState);
