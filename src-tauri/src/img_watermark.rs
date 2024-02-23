mod load_base;
mod load_watermark;
mod multi_thread;
mod single_img;

use single_img::single_opr;
use std::path::Path;

use crate::file_operation::read_folder;

use self::load_base::base_load_file;
use self::load_watermark::wm_load_file;
use self::multi_thread::multi_thread_opr;

#[tauri::command]
pub fn watermark_command(
    path_src: String,
    water_path: String,
    wtr_scaled: (u32, u32),
    img_dim: (u32, u32),
    coordinate: (i64, i64),
) -> Result<(), String> {
    let path_src = Path::new(&path_src);
    let water_path = Path::new(&water_path);

    if water_path.is_dir() {
        return Err("Watermark path is not image format".to_owned());
    }

    let water_ext = water_path.extension().and_then(std::ffi::OsStr::to_str);

    let water_buff = match water_ext {
        Some("jpg") | Some("jpeg") | Some("png") | Some("webp") => {
            Ok(wm_load_file(water_path).map_err(|err| err.to_string())?)
        }
        Some("svg") => todo!(),
        _ => Err("Not image format".to_owned()),
    }?;

    if path_src.is_file() {
        let extension = path_src.extension().and_then(std::ffi::OsStr::to_str);

        match extension {
            Some("jpg") | Some("jpeg") | Some("png") | Some("webp") => {
                let mut base_buffr = base_load_file(path_src).map_err(|err| err.to_string())?;
                Ok(single_opr(
                    path_src,
                    &mut base_buffr,
                    &water_buff,
                    wtr_scaled,
                    img_dim,
                    coordinate,
                )
                .map_err(|err| err.to_string())?)
            }
            _ => Err("Not image format".to_owned()),
        }?;
    } else {
        let images = read_folder(path_src).ok_or_else(|| "Error: Reading folder".to_string())?;

        multi_thread_opr(
            path_src,
            images,
            &water_buff,
            wtr_scaled,
            img_dim,
            coordinate,
        );
    }

    Ok(())
}
