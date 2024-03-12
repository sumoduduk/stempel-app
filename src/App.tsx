import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";

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
import prettyMilliseconds from "pretty-ms";
import NotFound from "./routes/not-found";
import stateRoute from "./state/state-route";
import About from "./routes/about";
import Nav from "./components/Nav";
import lang from "~/assets/lang.json";

function App() {
  const [imgRef, setImgRef] = createSignal<HTMLImageElement>();
  const [coordinate, setCoordinate] = createSignal({ x: 0, y: 0 });
  const [applyFolder, setApplyFolder] = createSignal(false);

  const { setScale, scale, waterImg, setWaterImg, wtrLoc, setWtrLoc } = wmState;

  const { route } = stateRoute;

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

  const { error_msg } = lang;
  const { error_base, error_watermark } = error_msg;

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
          title: error_base.title.eng,
          description: error_base.descriptions.eng,
          variant: "destructive",
        });
      }

      if (wtrPath.length === 0) {
        showToast({
          title: error_watermark.title.eng,
          description: error_watermark.descriptions.eng,
          variant: "destructive",
        });
      }

      if (applyFolder()) {
        showToast({
          title: (
            <Show
              when={!canProceed()}
              fallback={<h1 class="font-bold">{lang.complete_process.eng}</h1>}
            >
              <div class="flex w-full">
                <h3>{lang.processing.eng}</h3> <Spinner width="4" height="4" />
              </div>
            </Show>
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

      const milis = (await startInvoke(invokePar)) as number;
      const pretyMilis = prettyMilliseconds(milis);

      showToast({
        title: lang.finished.title.eng + " " + pretyMilis,
        description: lang.finished.descriptions.eng + " " + folderSrc(),
      });
    } catch (error) {
      const err = getErrorMessage(error);
      showToast({
        title: error_msg.error_something.title.eng,
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
      <div class="absolute m-3 size-full justify-center gap-6 bg-inherit p-8 text-center text-neutral-200 opacity-90">
        <Nav />
        <Switch fallback={<NotFound />}>
          <Match when={route() === "home"}>
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
              <div class="flex w-full items-center justify-between space-x-4 py-4 lg:px-10">
                <div class="flex w-1/2">
                  <Button
                    class="w-1/3 rounded-r-none border text-xs md:text-sm"
                    onClick={() =>
                      openImage(setBaseLoc, setImageBg, setFolderSrc, "base")
                    }
                  >
                    {lang.open_img.eng}
                  </Button>
                  <div class="flex w-2/3 items-center rounded-r-lg bg-white py-1 text-start text-gray-800">
                    <p class="w-fit truncate">{folderSrc()}</p>
                  </div>
                </div>

                <div class="flex w-1/2">
                  <Button
                    class="w-1/3 rounded-r-none border text-xs md:text-sm"
                    onClick={() =>
                      openImage(
                        setWtrLoc,
                        setWaterImg,
                        setFolderSrc,
                        "watermark",
                      )
                    }
                    disabled={imageBg().length === 0}
                  >
                    {lang.open_watermark.eng}
                  </Button>
                  <div class="flex w-2/3 items-center rounded-r-md bg-white py-1 text-start text-gray-800">
                    <p class="w-fit truncate">{wtrLoc()}</p>
                  </div>
                </div>
              </div>

              <div class="mx-auto my-4 flex items-center justify-center space-x-2">
                <Checkbox checked={applyFolder()} onChange={setApplyFolder} />
                <h3 class="m-auto select-none">{lang.apply_folder.eng}</h3>
              </div>

              <div class="pt-4">
                <Show
                  when={canProceed()}
                  fallback={
                    <Button
                      variant="secondary"
                      onClick={sendData}
                      disabled={!canProceed()}
                      class="h-12 border border-neutral-200 bg-transparent px-6 text-neutral-600"
                    >
                      {lang.proceed.eng}
                    </Button>
                  }
                >
                  <button
                    onClick={sendData}
                    disabled={!canProceed()}
                    class="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-medium text-neutral-200 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]"
                  >
                    {lang.proceed.eng}
                  </button>
                </Show>
              </div>
            </div>
          </Match>
          <Match when={route() === "about"}>
            <About />
          </Match>
        </Switch>
      </div>

      <Show when={waterImg().length > 0}>
        <OpenResize />
      </Show>
      <Toaster />
    </>
  );
}

export default App;
