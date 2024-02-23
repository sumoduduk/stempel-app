import { open } from "@tauri-apps/plugin-dialog";

export const getImages = async () => {
  console.log("clicked");
  const fileopen = await open({
    multiple: false,
    title: "Open Single Image",
    filters: [
      {
        name: "Image",
        extensions: ["jpeg", "jpg", "webp", "png"],
      },
    ],
  });
  console.log({ fileopen });
  return fileopen;
};

export const getWatermarkImage = async () => {
  return await open({
    multiple: false,
    title: "Open Image",
    filters: [
      {
        name: "Image",
        extensions: ["jpeg", "jpg", "webp", "png"],
      },
    ],
  });
};
