import { DragOptions, createDraggable } from "@neodrag/solid";
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { DragEL } from "~/types/img-types";
import baseState from "../state/base-state";
import proceed from "../state/proceed";
import { listen } from "@tauri-apps/api/event";

import stateProgress from "../state/progress";
import wmState from "../state/wm-state";

export const Draggabale: Component<DragEL> = (props) => {
  const [dimension, setDimension] = createSignal({ w: 0, h: 0 });
  const [dragRef, setDragRef] = createSignal<HTMLDivElement | null>(null);
  const { draggable } = createDraggable();
  // {`transition-all duration-700 will-change-[filter] hover:drop-shadow-[0_0_32px_#24c8db] `}

  const { setProgress } = stateProgress;
  const { basePosition, baseScale } = baseState;
  const { setCanProceed } = proceed;
  const { parentCoor, setParentCoor } = wmState;

  const options: DragOptions = {
    position: parentCoor(),
    bounds: "parent",
    onDrag: ({ offsetX, offsetY }) => {
      const { t: diffY, b: hi, l: diffX, r: wi } = basePosition();
      setParentCoor({ x: offsetX, y: offsetY });
      const coorX = offsetX - diffX;
      const coorY = offsetY - diffY;

      if (coorX < 0 || coorY < 0) {
        return setCanProceed(false);
      }
      if (coorX > wi || coorY > hi) {
        return setCanProceed(false);
      }

      setCanProceed(true);
      props.setCoordinate({ x: coorX, y: coorY });
    },
  };

  onMount(async () => {
    const unlisten = await listen("progress", (event) => {
      const payload = event.payload as number;

      setProgress(payload);
    });

    onCleanup(() => {
      unlisten();
    });
  });

  createEffect(() => {
    const refDrag = dragRef();
    if (!refDrag) return;
    const { w, h } = dimension();
    if (w === 0) return;

    const sw = parseFloat((w * props.scaleVal).toFixed(1));
    const sh = parseFloat((h * props.scaleVal).toFixed(1));

    refDrag.style.width = sw + "px";
    refDrag.style.height = sh + "px";
  });

  return (
    <img
      use:draggable={options}
      src={props.waterImg}
      ref={setDragRef}
      class="absolute left-0 top-0 outline-dashed outline-1 transition-transform duration-75"
      alt="Tauri logo"
      onLoad={(ev) => {
        const { naturalWidth, naturalHeight } = ev.currentTarget;

        const scaledWidth = naturalWidth * baseScale();
        const scaledHeight = naturalHeight * baseScale();

        ev.currentTarget.style.width = scaledWidth + "px";
        ev.currentTarget.style.height = scaledHeight + "px";

        setDimension({
          w: scaledWidth,
          h: scaledHeight,
        });
      }}
    />
  );
};
