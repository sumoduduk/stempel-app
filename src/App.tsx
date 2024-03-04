import { Show, createEffect, createSignal, onCleanup } from "solid-js";

import { Button } from "./components/ui/button";
import { convInt, startInvoke } from "./lib/utils";
import { InvokeParamsType } from "./types/img-types";
import { Draggabale } from "./components/Draggable";
import { openImage } from "./lib/open-image";
import { Checkbox } from "./components/ui/checkbox";

import wmState from "./state/wm-state";
import baseState from "./state/base-state";
import proceed from "./state/proceed";
import stateProgress from "./state/progress";
import imgState from "./state/img-state";

import OpenResize from "./components/OpenResize";
import { ProgressWm } from "./components/ProgressWm";
import { Toaster, showToast } from "./components/ui/toast";
import { getErrorMessage } from "./lib/error";
import Spinner from "./components/spinner";
import Hero from "./components/hero";
import Brand from "./components/Brand";

function App() {
  const [imgRef, setImgRef] = createSignal<HTMLImageElement>();
  const [coordinate, setCoordinate] = createSignal({ x: 0, y: 0 });
  const [applyFolder, setApplyFolder] = createSignal(false);

  const { setScale, scale, waterImg, setWaterImg, wtrLoc, setWtrLoc } = wmState;

  const {
    baseScale,
    setBaseScale,
    setBaseDimensionScaled,
    baseDimensionNatural,
    setBaseDimensionNatural,
    setBasePosition,
  } = baseState;

  const { baseLoc, setBaseLoc, imageBg, setImageBg, folderSrc, setFolderSrc } =
    imgState;

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
    try {
      setProgress(0);
      setCanProceed(false);
      const basePath = baseLoc();
      const wtrPath = wtrLoc();

      if (basePath.length === 0) {
        showToast({
          title: "Error: No Base Image",
          description: "Please upload base image",
          variant: "destructive",
        });
      }
      if (wtrPath.length === 0) {
        showToast({
          title: "Error: No Watermark Image",
          description: "Please upload watermark image",
          variant: "destructive",
        });
      }

      if (applyFolder()) {
        showToast({
          title: (
            <div class="flex w-full">
              <h3>Processing...</h3> <Spinner width="4" height="4" />
            </div>
          ),
          description: <ProgressWm />,
          persistent: true,
        });
      }

      const { x: cx, y: cy } = coordinate();

      const pathSrc = applyFolder() ? folderSrc() : basePath;

      const invokePar: InvokeParamsType = {
        pathSrc: pathSrc,
        waterPath: wtrPath,
        coordinate: [convInt(cx), convInt(cy)],
        globalScale: baseScale(),
        wmScale: finalScale(),
      };

      await startInvoke(invokePar);

      showToast({
        title: "Watermark Image Success",
        description: ` Open folder at ${folderSrc()}`,
      });
    } catch (error) {
      const err = getErrorMessage(error);
      showToast({
        title: "Something went wrong",
        description: err,
        variant: "destructive",
      });
    } finally {
      setCanProceed(true);
    }
  };

  const onResizeChange = (el: Element) => {
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

    setCanProceed(false);

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
    console.log("resize");
    const observer = new ResizeObserver((entries) => {
      const el = entries[0].target;

      onResizeChange(el);
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
      <Brand />
      <div class="absolute m-3 size-full justify-center gap-6 bg-inherit p-16 text-center text-neutral-200 opacity-90">
        <Show when={imageBg().length > 0} fallback={<Hero />}>
          <div
            class={`relative h-2/3 outline outline-1 ${
              canProceed() ? "outline-white" : "outline-red-600"
            }`}
          >
            <img
              src={imageBg()}
              class="size-full bg-background/80 object-contain"
              ref={setImgRef}
              onLoad={(evt) => {
                defaultState();
                const val = evt.currentTarget;

                const { naturalWidth, naturalHeight } = val;

                setBaseDimensionNatural({
                  wbn: naturalWidth,
                  hbn: naturalHeight,
                });

                onResizeChange(evt.target);
              }}
            />

            <Show when={waterImg().length > 0}>
              <Draggabale
                setCoordinate={setCoordinate}
                waterImg={waterImg()!}
              />
            </Show>
          </div>
        </Show>

        <div class="flex h-1/3 w-full flex-col items-center justify-center space-y-3">
          <div class="flex w-full items-center justify-center space-x-4 px-10 py-4">
            <div class="flex w-1/2">
              <Button
                class="w-1/3 text-xs md:text-sm"
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

            <div class="flex w-1/2">
              <Button
                class="w-1/3 text-xs md:text-sm"
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

          <div class="mx-auto my-4 flex items-center justify-center space-x-2">
            <Checkbox checked={applyFolder()} onChange={setApplyFolder} />
            <h3 class="m-auto">Apply to all image in folder ?</h3>
          </div>

          <div class="pt-4">
            <Button
              variant="secondary"
              onClick={sendData}
              disabled={!canProceed()}
            >
              PROCEED
            </Button>
          </div>
        </div>
      </div>

      <Show when={waterImg().length > 0}>
        <OpenResize />
      </Show>
      <Toaster />
    </>
  );
}

export default App;
