import { dirname } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";

export const getImages = async () => {
  const path = getPathStorage();

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
  const path = getPathStorage();
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

export async function savePathToStorage(path: string) {
  const parent = await dirname(path);
  window.localStorage.setItem("folder_path", path);
  return parent;
}

function getPathStorage() {
  const path = window.localStorage.getItem("folder_path");
  return path;
}
