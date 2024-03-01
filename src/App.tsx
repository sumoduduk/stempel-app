import { createEffect, createSignal, onCleanup } from "solid-js";

import { Button } from "./components/ui/button";
import { convInt, startInvoke } from "./lib/utils";
import { InvokeParamsType } from "./types/img-types";
import { Dragabale } from "./components/Draggable";
import { openImage } from "./lib/open-image";
import { Checkbox } from "./components/ui/checkbox";

import wmState from "./state/wm-state";
import baseState from "./state/base-state";
import proceed from "./state/proceed";
import stateProgress from "./state/progress";

import OpenResize from "./components/OpenResize";
import { ProgressWm } from "./components/ProgressWm";

function App() {
  const [imgRef, setImgRef] = createSignal<HTMLImageElement>();
  const [coordinate, setCoordinate] = createSignal({ x: 0, y: 0 });
  const [baseLoc, setBaseLoc] = createSignal<string>("");
  const [imageBg, setImageBg] = createSignal<string>("");
  const [folderSrc, setFolderSrc] = createSignal<string>("");
  const [applyFolder, setApplyFolder] = createSignal(false);

  const {
    setScale,
    scale,
    waterImg,
    setWaterImg,
    wtrLoc,
    setWtrLoc,
    setParentCoor,
  } = wmState;

  const {
    baseScale,
    setBaseScale,
    setBaseDimensionScaled,
    baseDimensionNatural,
    setBaseDimensionNatural,
    setBasePosition,
  } = baseState;

  const { canProceed, setCanProceed } = proceed;
  const { setProgress } = stateProgress;

  const finalScale = () => parseFloat((scale()[0] / 100).toFixed(1));

  const defaultState = () => {
    setCoordinate({ x: 0, y: 0 });
    setWaterImg("");
    setWtrLoc("");
    setScale([100]);
    setApplyFolder(false);
    setCanProceed(false);
  };

  const sendData = async () => {
    setProgress(0);
    const basePath = baseLoc();
    const wtrPath = wtrLoc();

    if (basePath.length === 0) return;
    if (wtrPath.length === 0) return;

    const { x: cx, y: cy } = coordinate();

    const invokePar: InvokeParamsType = {
      pathSrc: applyFolder() ? folderSrc() : basePath,
      waterPath: wtrPath,
      coordinate: [convInt(cx), convInt(cy)],
      globalScale: baseScale(),
      wmScale: finalScale(),
    };

    await startInvoke(invokePar);
  };

  const onResizeChange = (el: Element, fr: string) => {
    const { height, width } = el.getBoundingClientRect();

    const { wbn: naturalWidth, hbn: naturalHeight } = baseDimensionNatural();

    const ratio = naturalWidth / naturalHeight;
    let wi = ratio * height;
    let hi = height;
    if (wi > width) {
      wi = width;
      hi = width / ratio;
    }
    const xVal = (width - wi) / 2;
    const yVal = (height - hi) / 2;

    setBasePosition({
      l: xVal,
      r: wi,
      t: yVal,
      b: hi,
    });

    setBaseScale(wi / naturalWidth);
    setBaseDimensionScaled({
      wbase: wi,
      hbase: hi,
    });
    setScale([100]);
  };

  createEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const el = entries[0].target;

      setParentCoor({ x: 0, y: 0 });

      onResizeChange(el, "resize observer");
    });

    const element = imgRef();
    if (element) {
      observer.observe(element);
    }

    onCleanup(() => {
      if (element) {
        observer.unobserve(element);
      }
    });
  });

  return (
    <>
      <div class="absolute m-3 size-full justify-center gap-6 bg-inherit p-16 text-center text-neutral-200">
        {imageBg().length > 0 ? (
          <div
            class={`relative h-2/3 outline outline-1 ${
              canProceed() ? "outline-white" : "outline-red-600"
            }`}
          >
            <img
              src={imageBg()}
              class="size-full object-contain"
              ref={setImgRef}
              onLoad={(evt) => {
                defaultState();
                const val = evt.currentTarget;

                const { naturalWidth, naturalHeight } = val;

                setBaseDimensionNatural({
                  wbn: naturalWidth,
                  hbn: naturalHeight,
                });

                onResizeChange(evt.target, "load");
              }}
            />

            {waterImg().length > 0 && (
              <Dragabale
                scaleVal={finalScale()}
                setCoordinate={setCoordinate}
                waterImg={waterImg()!}
              />
            )}
          </div>
        ) : (
          <div class="flex h-1/2 w-full flex-col items-center justify-center">
            <h1 class="text-3xl">STEMPEL</h1>
            <h2 class="text-lg">Fast Image Watermarker</h2>
          </div>
        )}

        {/* <p class="terxt-3xl p-6 text-neutral-300">Fast Image Watermark</p> */}

        <div class="flex h-1/3 w-full flex-col items-center justify-center space-y-1">
          <div class="flex w-full items-center justify-center space-x-4 p-10">
            <div class="flex w-full">
              <Button
                class="w-1/3"
                onClick={() =>
                  openImage(setBaseLoc, setImageBg, setFolderSrc, "base")
                }
              >
                Open Image
              </Button>
              <div class="flex w-full items-center rounded-r-lg bg-white py-1 text-start text-gray-800">
                <p class="truncate">{folderSrc()}</p>
              </div>
            </div>

            <div class="flex w-full">
              <Button
                class="w-1/3"
                onClick={() =>
                  openImage(setWtrLoc, setWaterImg, setFolderSrc, "watermark")
                }
                disabled={imageBg().length === 0}
              >
                Load Watermark
              </Button>
              <div class="flex w-full items-center rounded-r-lg bg-white py-1 text-start text-gray-800">
                <p class="truncate">{wtrLoc()}</p>
              </div>
            </div>
          </div>

          <div class="mx-auto flex items-center justify-center space-x-2">
            <Checkbox checked={applyFolder()} onChange={setApplyFolder} />
            <h3 class="m-auto">Apply to all image in folder ?</h3>
          </div>

          <div class="mt-4">
            <Button onClick={sendData} disabled={!canProceed()}>
              PROCEED
            </Button>
          </div>
          <div class="lg:1/2 mx-auto w-3/4">
            <ProgressWm />
          </div>
        </div>
      </div>

      {waterImg().length > 0 && <OpenResize />}
    </>
  );
}

export default App;
