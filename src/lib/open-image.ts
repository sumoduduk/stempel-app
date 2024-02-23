import { convertFileSrc } from "@tauri-apps/api/core";
import { getImages, getWatermarkImage } from "./fs-utils";
import { Setter } from "solid-js";

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
    console.log({ imageLoc });
  } else {
    imageLoc = await getWatermarkImage();
  }
  if (!imageLoc) return;

  let strPath = imageLoc.path;
  if (!strPath) return;
  if (typeImage == "base") {
    let parent = strPath.split("/");
    parent.pop();

    const par = parent.join("/");

    setFolderSrc(par);
  }
  setLoc(imageLoc.path);
  console.log("path ", imageLoc.path);
  const image = convertFileSrc(imageLoc.path);
  console.log({ image });
  setImage(image);
}
