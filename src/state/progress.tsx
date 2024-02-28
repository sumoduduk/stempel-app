import { createRoot, createSignal } from "solid-js";

function stateProgress() {
  const [progress, setProgress] = createSignal(0);
  return { progress, setProgress };
}

export default createRoot(stateProgress);
