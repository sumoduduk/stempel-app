mod load_base;
mod load_watermark;
mod multi_thread;
mod single_img;

use crate::file_operation::read_folder;
use image::{imageops, GenericImageView, ImageBuffer, Rgba};
use single_img::single_opr;
use std::path::Path;
use std::sync::mpsc::channel;
use std::thread;
use tauri::{Manager, Runtime};

use std::time::Instant;

use self::load_base::base_load_file;
use self::load_watermark::wm_load_file;
use self::multi_thread::multi_thread_opr;

type ImgBuf = ImageBuffer<Rgba<u8>, Vec<u8>>;

#[tauri::command]
pub async fn watermark_command<R: Runtime>(
    path_src: String,
    water_path: String,
    coordinate: (i64, i64),
    global_scale: f32,
    wm_scale: f32,
    window: tauri::Window<R>,
) -> Result<u128, String> {
    let path_src = Path::new(&path_src);
    let water_path = Path::new(&water_path);

    if water_path.is_dir() {
        return Err("Watermark path is not image format".to_owned());
    }

    let water_ext = water_path.extension().and_then(std::ffi::OsStr::to_str);

    let start = Instant::now();

    let water_buff = match water_ext {
        Some("jpg") | Some("jpeg") | Some("png") | Some("webp") => {
            Ok(wm_load_file(water_path).map_err(|err| err.to_string())?)
        }
        Some("svg") => todo!(),
        _ => Err("Not image format".to_owned()),
    }?;

    let (ww, hw) = water_buff.dimensions();

    let final_ww = (ww as f32 * wm_scale) as u32;
    let final_wh = (hw as f32 * wm_scale) as u32;

    let water_buff = imageops::resize(
        &water_buff,
        final_ww,
        final_wh,
        imageops::FilterType::Nearest,
    );

    let coor_x = (coordinate.0 as f32 / global_scale) as i64;
    let coor_y = (coordinate.1 as f32 / global_scale) as i64;

    let coordinate = (coor_x, coor_y);

    if path_src.is_file() {
        let extension = path_src.extension().and_then(std::ffi::OsStr::to_str);

        match extension {
            Some("jpg") | Some("jpeg") | Some("png") | Some("webp") => {
                let mut base_buffr = base_load_file(path_src).map_err(|err| err.to_string())?;
                Ok(
                    single_opr(path_src, &mut base_buffr, &water_buff, coordinate)
                        .map_err(|err| err.to_string())?,
                )
            }
            _ => Err("Not image format".to_owned()),
        }?;
    } else {
        let images = read_folder(path_src).ok_or_else(|| "Error: Reading folder".to_string())?;

        let len = images.len();

        let (tx, rx) = channel();

        thread::spawn(move || {
            let mut initial = 0;
            while let Ok(_count) = rx.recv() {
                initial += 1;

                let new_init = initial;

                let progress = (new_init * 100) / (4 * len as i32);

                dbg!(progress);
                window
                    .emit("progress", progress)
                    .map_err(|err| format!("ERROR: {err}"))
                    .unwrap();
            }
        });

        multi_thread_opr(path_src, images, water_buff, coordinate, tx);
    }

    let duration = start.elapsed();
    let milis = duration.as_millis();
    Ok(milis)
}
