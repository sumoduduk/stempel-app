import { convertFileSrc } from "@tauri-apps/api/core";
import { getImages, getWatermarkImage, savePathToStorage } from "./fs-utils";
import { Setter } from "solid-js";
import { showToast } from "../components/ui/toast";

type ImageOpen = "base" | "watermark";

export async function openImage(
  setLoc: Setter<string>,
  setImage: Setter<string>,
  setFolderSrc: Setter<string>,
  typeImage: ImageOpen,
) {
  let imageLoc;
  if (typeImage == "base") {
    imageLoc = await getImages();
  } else {
    imageLoc = await getWatermarkImage();
  }
  if (!imageLoc) return;

  let strPath = imageLoc.path;

  if (!strPath) {
    showToast({
      title: "Please specify image path",
      variant: "destructive",
    });
  }

  if (typeImage == "base") {
    let parent = strPath.split("/");
    parent.pop();

    const par = parent.join("/");

    savePathToStorage("folder_path", par);

    setFolderSrc(par);
  } else {
    let parent = strPath.split("/");
    parent.pop();

    const par = parent.join("/");

    savePathToStorage("wm_path", par);
  }

  setLoc(imageLoc.path);

  const image = convertFileSrc(imageLoc.path);

  setImage(image);
}
