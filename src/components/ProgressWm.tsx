import { Progress, ProgressValueLabel } from "./ui/progress";
import stateProgress from "../state/progress";
import { createMemo } from "solid-js";

export function ProgressWm() {
  const { progress } = stateProgress;

  const progressNow = createMemo(() => progress());

  return (
    <Progress
      value={progressNow()}
      minValue={0}
      maxValue={100}
      getValueLabel={({ value }) => `${value}%`}
      class="w-full text-white"
    >
      <ProgressValueLabel />
    </Progress>
  );
}
