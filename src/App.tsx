import { createEffect, createSignal } from "solid-js";

import { Button } from "./components/ui/button";
import { convInt, startInvoke } from "./lib/utils";
import { DimensionType, InvokeParamsType } from "./types/img-types";
import { Dragabale } from "./components/Draggable";
import { openImage } from "./lib/open-image";
import { Checkbox } from "./components/ui/checkbox";
import { ResizeSlider } from "./components/ResizeSlider";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [scale, setScale] = createSignal([100]);
  const [baseDimension, setBaseDimension] = createSignal<DimensionType>({
    w: 0,
    h: 0,
  });
  const [scaledDimension, setScaledDimension] = createSignal<DimensionType>({
    w: 0,
    h: 0,
  });
  const [coordinateBase, setCoordinateBase] = createSignal({ bx: 0, by: 0 });
  const [coordinate, setCoordinate] = createSignal({ x: 0, y: 0 });
  const [baseLoc, setBaseLoc] = createSignal<string>("");
  const [imageBg, setImageBg] = createSignal<string>("");
  const [wtrLoc, setWtrLoc] = createSignal<string>("");
  const [waterImg, setWaterImg] = createSignal<string>("");
  const [folderSrc, setFolderSrc] = createSignal<string>("");
  const [applyFolder, setApplyFolder] = createSignal<boolean>(false);

  createEffect(() => {
    let imgbg = imageBg();
    console.log("imgbg", imgbg.length);

    let wtbg = waterImg();
    console.log("wtbg", wtbg.length);
  });

  const sendData = async () => {
    const basePath = baseLoc();
    const wtrPath = wtrLoc();

    if (basePath.length === 0) return;
    if (wtrPath.length === 0) return;

    const { w: bw, h: bh } = baseDimension();
    const { w: ww, h: hw } = scaledDimension();
    const { x: cx, y: cy } = coordinate();

    const invokePar: InvokeParamsType = {
      pathSrc: applyFolder() ? folderSrc() : basePath,
      waterPath: wtrPath,
      wtrScaled: [convInt(ww), convInt(hw)],
      imgDim: [convInt(bw), convInt(bh)],
      coordinate: [convInt(cx), convInt(cy)],
    };

    console.log({ invokePar });
    await startInvoke(invokePar);
  };

  const finalScale = () => parseFloat((scale()[0] / 100).toFixed(1));

  async function greetFe(name: string) {
    let names: string = await invoke("greet", { name: name });
    setFolderSrc(names);
  }

  return (
    <div class="flex min-h-screen flex-col justify-center gap-6 bg-neutral-800 text-center text-neutral-200">
      {imageBg().length > 0 && (
        <div class="relative mx-auto w-fit">
          <img
            src={imageBg()}
            onLoad={(evt) => {
              const { x, y } = evt.target.getBoundingClientRect();
              setCoordinateBase({ bx: x, by: y });
              const val = window.getComputedStyle(evt.target);
              const { width, height } = val;
              setBaseDimension({
                w: parseFloat(width),
                h: parseFloat(height),
              });
            }}
          />

          {waterImg().length > 0 && (
            <Dragabale
              scaleVal={finalScale()}
              setScaledDimension={setScaledDimension}
              setCoordinate={setCoordinate}
              waterImg={waterImg()!}
              coordinateBase={coordinateBase()}
            />
          )}
        </div>
      )}

      {/* <p class="p-6 text-3xl text-neutral-300">Stempel</p> */}

      <h1 class="h-auto w-auto text-center text-4xl font-semibold text-neutral-50">
        path dir : {folderSrc()}
      </h1>

      <div class="flex flex-col items-center justify-center space-y-4 p-10">
        <Button
          onClick={() =>
            // openImage(setBaseLoc, setImageBg, setFolderSrc, "base")

            greetFe("calista")
          }
        >
          Open Image
        </Button>
        <Button
          onClick={() =>
            openImage(setWtrLoc, setWaterImg, setFolderSrc, "watermark")
          }
          disabled={imageBg().length === 0}
        >
          Load Watermark
        </Button>
      </div>
      {waterImg().length > 0 && (
        <ResizeSlider scale={scale} setScale={setScale} />
      )}

      <div class="mx-auto flex items-center space-x-2">
        <Checkbox checked={applyFolder()} onChange={setApplyFolder} />
        <h3 class="m-auto">Apply to all image in folder ?</h3>
      </div>

      <div>
        <Button onClick={sendData}>PROCEED</Button>
      </div>
    </div>
  );
}

export default App;
