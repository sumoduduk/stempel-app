import { Slider, SliderFill, SliderThumb, SliderTrack } from "./ui/slider";

import { Accessor, Component, Setter } from "solid-js";

interface IResizeSlider {
  scale: Accessor<number[]>;
  setScale: Setter<number[]>;
}

export const ResizeSlider: Component<IResizeSlider> = ({ scale, setScale }) => {
  return (
    <div class="mx-auto flex w-1/2 flex-col justify-center space-y-3">
      <h2>Resize Watermark</h2>
      <Slider value={scale()} onChange={setScale} minValue={1} maxValue={400}>
        <SliderTrack>
          <SliderFill />
          <SliderThumb />
        </SliderTrack>
      </Slider>
    </div>
  );
};
