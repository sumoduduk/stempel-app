import { createRoot, createSignal } from "solid-js";

function imgState() {
  const [baseLoc, setBaseLoc] = createSignal<string>("");
  const [imageBg, setImageBg] = createSignal<string>("");
  const [folderSrc, setFolderSrc] = createSignal<string>("");

  return { baseLoc, setBaseLoc, imageBg, setImageBg, folderSrc, setFolderSrc };
}

export default createRoot(imgState);
