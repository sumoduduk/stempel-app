import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { JSXElement } from "solid-js";
import { ResizeSlider } from "./ResizeSlider";
import wmState from "../state/wm-state";
import { Button } from "./ui/button";
import lang from "~/assets/lang.json";

const OpenButton = ({ children }: { children: JSXElement }) => {
  return (
    <Button class="fixed right-0 top-3/4 origin-bottom-right -rotate-90 rounded border bg-gray-50/10 p-1 text-white">
      {children}
    </Button>
  );
};

export default function OpenResize() {
  const { setScale, scale } = wmState;
  return (
    <Sheet>
      <SheetTrigger>
        <OpenButton>{lang.open_resize.eng}</OpenButton>
      </SheetTrigger>

      <SheetContent size="sm" position="bottom" class="flex flex-col space-y-8">
        <SheetHeader class="flex w-full justify-center text-white">
          <SheetTitle class="text-center">{lang.open_resize.eng}</SheetTitle>
        </SheetHeader>
        <ResizeSlider scale={scale} setScale={setScale} />
      </SheetContent>
    </Sheet>
  );
}
