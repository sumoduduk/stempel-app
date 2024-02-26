import { DragOptions, createDraggable } from "@neodrag/solid";
import { Component, createEffect, createSignal, onMount } from "solid-js";
import { DragEL } from "~/types/img-types";
import baseState from "../state/base-state";
import proceed from "../state/proceed";

export const Dragabale: Component<DragEL> = (props) => {
  const [dimension, setDimension] = createSignal({ w: 0, h: 0 });
  const [dragRef, setDragRef] = createSignal<HTMLDivElement | null>(null);
  const { draggable } = createDraggable();
  // {`transition-all duration-700 will-change-[filter] hover:drop-shadow-[0_0_32px_#24c8db] `}

  const { basePosition, baseScale } = baseState;
  const { canProceed, setCanProceed } = proceed;

  const { t: diffY, b: hi, l: diffX, r: wi } = basePosition();

  const options: DragOptions = {
    bounds: "parent",
    onDragEnd: ({ offsetX, offsetY }) => {
      const coorX = offsetX - diffX;
      const coorY = offsetY - diffY;
      console.log(basePosition());
      console.log({ coorX, coorY });
      console.log({ canProceed: canProceed() });

      if (coorX < 0 || coorY < 0) {
        return setCanProceed(false);
      }
      if (coorX > wi || coorY > hi) {
        return setCanProceed(false);
      }

      console.log("hit");
      setCanProceed(true);
      props.setCoordinate({ x: coorX, y: coorY });
    },
  };

  createEffect(() => {
    const refDrag = dragRef();
    if (!refDrag) return;
    const { w, h } = dimension();
    console.log({ w, h });
    if (w === 0) return;

    const sw = parseFloat((w * props.scaleVal).toFixed(1));
    const sh = parseFloat((h * props.scaleVal).toFixed(1));

    refDrag.style.width = sw + "px";
    refDrag.style.height = sh + "px";
    // console.log({ sw, sh });
    props.setScaledDimension({ w: sw, h: sh });
  });

  return (
    <img
      use:draggable={options}
      src={props.waterImg}
      ref={setDragRef}
      class="absolute left-0 top-0 outline-dashed outline-1 transition-transform duration-75"
      alt="Tauri logo"
      onLoad={(ev) => {
        const { width, height } = window.getComputedStyle(ev.target);

        const scaledWidth = parseFloat(width) * baseScale();
        const scaledHeight = parseFloat(height) * baseScale();

        ev.currentTarget.style.width = scaledWidth + "px";
        ev.currentTarget.style.height = scaledHeight + "px";

        setDimension({
          w: scaledWidth,
          h: scaledHeight,
        });
        props.setScaledDimension({
          w: scaledWidth,
          h: scaledHeight,
        });
      }}
    />
  );
};
