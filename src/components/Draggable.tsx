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
  const [dragRef, setDragRef] = createSignal<HTMLImageElement | null>(null);
  const { draggable } = createDraggable();
  // {`transition-all duration-700 will-change-[filter] hover:drop-shadow-[0_0_32px_#24c8db] `}

  const { setProgress } = stateProgress;
  const { basePosition, baseScale } = baseState;
  const { setCanProceed } = proceed;

  const { scale } = wmState;

  const options: DragOptions = {
    bounds: "parent",
    onDrag: ({ offsetX, offsetY }) => {
      const { t: diffY, b: hi, l: diffX, r: wi } = basePosition();
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
    let refDrag = dragRef();
    if (!refDrag) return;

    const { w, h } = dimension();
    if (w === 0) return;

    const scaleVal = parseFloat((scale()[0] / 100).toFixed(1));

    if (scaleVal === 1) {
      const scaleBase = baseScale();
      const { naturalWidth, naturalHeight } = refDrag;

      const scaledWidth = naturalWidth * scaleBase;
      const scaledHeight = naturalHeight * scaleBase;

      if (scaledWidth === w && scaledHeight === h) {
        return;
      }

      setDimension({
        w: scaledWidth,
        h: scaledHeight,
      });

      refDrag.style.width = scaledWidth + "px";
      refDrag.style.height = scaledHeight + "px";

      setDragRef(refDrag);
    } else {
      const sw = parseFloat((w * scaleVal).toFixed(1));
      const sh = parseFloat((h * scaleVal).toFixed(1));

      refDrag.style.width = sw + "px";
      refDrag.style.height = sh + "px";

      setDragRef(refDrag);
    }
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
