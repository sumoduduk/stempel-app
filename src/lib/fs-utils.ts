import { dirname } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";

export const getImages = async () => {
  const path = getPathStorage("folder_path");

  return await open({
    multiple: false,
    title: "Open Single Image",
    defaultPath: path ? path : "",
    filters: [
      {
        name: "Image",
        extensions: ["jpeg", "jpg", "webp", "png"],
      },
    ],
  });
};

export const getWatermarkImage = async () => {
  const path = getPathStorage("wm_path");
  return await open({
    multiple: false,
    title: "Open Image",
    defaultPath: path ? path : "",
    filters: [
      {
        name: "Image",
        extensions: ["jpeg", "jpg", "webp", "png"],
      },
    ],
  });
};

export async function savePathToStorage(key: string, path: string) {
  const parent = await dirname(path);
  window.localStorage.setItem(key, path);
  return parent;
}

function getPathStorage(key: string) {
  const path = window.localStorage.getItem(key);
  return path;
}
