import { Progress, ProgressLabel, ProgressValueLabel } from "./ui/progress";
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
    >
      <div class="flex justify-between">
        <ProgressLabel>Processing...</ProgressLabel>
        <ProgressValueLabel />
      </div>
    </Progress>
  );
}
