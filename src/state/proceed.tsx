import { createRoot, createSignal } from "solid-js";

function proceed() {
  const [canProceed, setCanProceed] = createSignal(false);
  return { canProceed, setCanProceed };
}

export default createRoot(proceed);
