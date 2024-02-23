use image::{
    imageops::{resize, FilterType},
    DynamicImage,
};

pub fn begin_scale(
    watermark_img: &DynamicImage,
    width: u32,
    height: u32,
    filter: FilterType,
) -> image::ImageBuffer<image::Rgba<u8>, Vec<u8>> {
    resize(watermark_img, width, height, filter)
}
