use std::path::Path;

use eyre::OptionExt;
use image::{imageops, DynamicImage};

use crate::{
    file_operation::{create_folder, get_filename},
    scale_image::begin_scale,
    utils::get_seconds,
};

pub fn single_opr(
    image_path: &Path,
    img_buffer: &mut DynamicImage,
    water_buff: &DynamicImage,
    wtr_scaled: (u32, u32),
    img_dim: (u32, u32),
    coordinate: (i64, i64),
) -> eyre::Result<()> {
    dbg!(image_path);
    dbg!(wtr_scaled);
    dbg!(img_dim);
    dbg!(coordinate);

    let folder_img = image_path.parent().ok_or_eyre("folder not exist")?;

    //TODO: next to compute scale of img_buffer
    //TODO: next to compute scale of watermark

    let (ww, wh) = wtr_scaled;
    let (cw, ch) = coordinate;
    let wtr_scale = begin_scale(water_buff, ww, wh, imageops::FilterType::Nearest);

    imageops::overlay(img_buffer, &wtr_scale, cw, ch);

    let file_name = get_filename(image_path).ok_or_eyre("ERROR: can't get file name")?;
    let seconds = get_seconds();

    let file_name = format!("watermark_{seconds}_{file_name}");

    let out_folder = folder_img.join("single_result");

    create_folder(&out_folder);
    let out_name = out_folder.join(&file_name);
    img_buffer.save(out_name)?;

    Ok(())
}

#[cfg(test)]
mod test {

    use super::*;
    use std::path::Path;

    const BASE_PNG: &str = "/home/calista/Pictures/Screenshots/hoaks.png";
    const WATER_PNG: &str = "/home/calista/Pictures/tauri_logo.png";
    const BASE_WEBP: &str = "/home/calista/Pictures/pp.webp";

    fn base_test(base_path: &str, water_path: &str) -> eyre::Result<()> {
        let wtr_scaled = (250, 250);
        let img_dim = (250, 250);
        let coordinate = (0, 0);

        let path_src = Path::new(base_path);
        let water_path = Path::new(water_path);

        let water_buff = image::open(water_path)?;
        let mut img_buffer = image::open(path_src)?;

        let res = single_opr(
            path_src,
            &mut img_buffer,
            &water_buff,
            wtr_scaled,
            img_dim,
            coordinate,
        );
        dbg!(&res);
        res
    }

    #[test]
    fn test_single_png() -> eyre::Result<()> {
        let res = base_test(BASE_PNG, WATER_PNG);

        assert!(res.is_ok());
        Ok(())
    }

    #[test]
    fn test_single_webp() {
        let res = base_test(BASE_WEBP, WATER_PNG);

        assert!(res.is_ok());
    }
}
