use eyre::eyre;
use image::{imageops, load, ImageFormat};
use std::{
    io::{BufReader, Cursor},
    path::Path,
    sync::Arc,
};
use tauri::async_runtime::spawn;
use tokio::{
    fs::{create_dir, read, read_dir, File},
    io::AsyncWriteExt,
    task::spawn_blocking,
};

use crate::{file_operation::is_image, utils::get_seconds};

use image::io::Reader as ImgReader;

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

        let file_path = is_image(entry.path());

        match file_path {
            Some(file_path) => {
                let handle = spawn(async move {
                    if let Ok(img_data) = read(file_path).await {
                        let cursor = Cursor::new(img_data);

                        let img_main = ImgReader::new(cursor)
                            .with_guessed_format()
                            .map_err(|err| eprintln!("Error: {err}"));
                        if let Ok(img_main) = img_main {
                            if let Ok(mut img_buff) = img_main.decode() {
                                imageops::overlay(&mut img_buff, water_scale.as_ref(), 2, 2);

                                let mut bytes = vec![];
                                let write_res = img_buff
                                    .write_to(&mut Cursor::new(&mut bytes), ImageFormat::Png);

                                if let Ok(_write) = write_res {
                                    let file_out = out_folder.join(file_name);
                                    if let Ok(mut output_file) = File::create(&file_out).await {
                                        if let Ok(_save_res) = output_file.write_all(&bytes).await {
                                            println!("file output : {:?}", &file_out);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                handles.push(handle)
            }
            None => println!("INFO: Not an image file"),
        }
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
