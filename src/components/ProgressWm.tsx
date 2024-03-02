import { Progress, ProgressLabel, ProgressValueLabel } from "./ui/progress";
import stateProgress from "../state/progress";
import { createMemo } from "solid-js";
import Spinner from "./spinner";

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
      <div class="my-1 flex w-full justify-between px-4">
        <ProgressLabel class="w-full">
          <p>Processing...</p> <Spinner width="4" height="4" />
        </ProgressLabel>
        <ProgressValueLabel />
      </div>
    </Progress>
  );
}
