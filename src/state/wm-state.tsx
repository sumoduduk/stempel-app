import { createRoot, createSignal } from "solid-js";

function wmState() {
  const [parentCoor, setParentCoor] = createSignal({ x: 0, y: 0 });
  const [scale, setScale] = createSignal([100]);
  const [wtrLoc, setWtrLoc] = createSignal<string>("");
  const [waterImg, setWaterImg] = createSignal<string>("");

  return {
    parentCoor,
    setParentCoor,
    scale,
    setScale,
    waterImg,
    setWaterImg,
    wtrLoc,
    setWtrLoc,
  };
}

export default createRoot(wmState);
