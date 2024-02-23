import { DragOptions, createDraggable } from "@neodrag/solid";
import { Component, createEffect, createSignal } from "solid-js";
import { DragEL } from "~/types/img-types";

export const Dragabale: Component<DragEL> = (props) => {
  const [dimension, setDimension] = createSignal({ w: 0, h: 0 });
  const [dragRef, setDragRef] = createSignal<HTMLDivElement | null>(null);
  const { draggable } = createDraggable();
  // {`transition-all duration-700 will-change-[filter] hover:drop-shadow-[0_0_32px_#24c8db] `}
  const options: DragOptions = {
    bounds: "parent",
    onDragEnd: ({ offsetX, offsetY }) => {
      props.setCoordinate({ x: offsetX, y: offsetY });
    },
  };

  createEffect(() => {
    const refDrag = dragRef();
    if (!refDrag) return;
    const { w, h } = dimension();
    if (w === 0) return;

    console.log("scaleVal", props.scaleVal);

    const sw = parseFloat((w * props.scaleVal).toFixed(1));
    const sh = parseFloat((h * props.scaleVal).toFixed(1));
    console.log({ sw, sh });

    refDrag.style.width = sw + "px";
    refDrag.style.height = sh + "px";
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
        setDimension({
          w: parseInt(width, 10),
          h: parseInt(height, 10),
        });
        props.setScaledDimension({
          w: parseInt(width, 10),
          h: parseInt(height, 10),
        });
      }}
    />
  );
};
