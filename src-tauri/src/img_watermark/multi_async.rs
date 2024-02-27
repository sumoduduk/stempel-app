use eyre::eyre;
use image::{imageops, load, ImageFormat};
use std::{io::BufReader, path::Path, sync::Arc};
use tauri::async_runtime::{spawn, spawn_blocking};
use tokio::fs::{create_dir, read_dir, File};

use crate::utils::get_seconds;

use super::ImgBuf;

pub async fn multi_task(path_src: &Path, wtr_buff: ImgBuf) -> eyre::Result<()> {
    let seconds = get_seconds();
    let folder_name = format!("watermark_{seconds}");
    let out_folder_name = path_src.join(&folder_name);
    let out_folder = Arc::new(out_folder_name);
    let water_scale = Arc::new(wtr_buff);

    create_dir(out_folder.as_ref()).await?;

    let mut dir = read_dir(path_src).await?;

    let mut handles = vec![];

    while let Some(entry) = dir.next_entry().await? {
        let out_folder = Arc::clone(&out_folder);
        let water_scale = Arc::clone(&water_scale);

        let file_name = entry
            .file_name()
            .into_string()
            .map_err(|err| eyre!("error {:?}", err))?;

        let file_path = entry.path();

        let handle = spawn(async move {
            let file = File::open(&file_path).await;
            match file {
                Ok(file) => {
                    let buf_read = BufReader::new(file.into_std().await);
                    if let Ok(extens) = ImageFormat::from_path(&file_name) {
                        if let Ok(mut img_buff) = load(buf_read, extens) {
                            let wtr_mark = water_scale.as_ref();
                            imageops::overlay(&mut img_buff, wtr_mark, 2, 2);

                            let file_out = out_folder.join(file_name);

                            if let Err(err) = img_buff.save(&file_out) {
                                eprintln!("{err}");
                            }
                            println!("file output : {:?}", &file_out);
                        }
                    }
                }
                Err(err) => eprintln!("INFO: {err}"),
            }
        });

        handles.push(handle)
    }

    for handle in handles {
        handle.await?;
    }

    Ok(())
}

#[cfg(test)]
mod test {
    use super::*;

    const WM_PATH: &str = "/home/calista/Pictures/tauri_logo.png";
    const FOLDER_PATH: &str = "/home/calista/Pictures/img-robo/";

    #[tokio::test]
    async fn test_async() -> eyre::Result<()> {
        let water_buffr = image::open(WM_PATH)?.to_rgba8();
        let path_src = Path::new(FOLDER_PATH);

        let res = multi_task(path_src, water_buffr).await;

        assert!(res.is_ok());

        Ok(())
    }
}
