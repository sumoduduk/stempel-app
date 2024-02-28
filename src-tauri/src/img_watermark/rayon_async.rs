use eyre::eyre;
use rayon::prelude::*;
use std::{io::Cursor, path::Path, sync::Arc};
use tokio::{
    fs::{create_dir, read, read_dir, File},
    io::AsyncWriteExt,
};

use super::ImgBuf;
use crate::{file_operation::is_image, utils::get_seconds};

use image::{imageops, io::Reader as ImgReader, ImageFormat};

pub async fn multi_rayon(path_src: &Path, wtr_buff: ImgBuf) -> eyre::Result<()> {
    let seconds = get_seconds();
    let folder_name = format!("watermark_{seconds}");
    let out_folder_name = path_src.join(&folder_name);
    let out_folder = Arc::new(out_folder_name);
    // let water_scale = Arc::new(wtr_buff);

    let (tx, recv) = tokio::sync::oneshot::channel();

    create_dir(out_folder.as_ref()).await?;

    let mut dir = read_dir(path_src).await?;

    let mut handles = Vec::new();

    let mut files_path = Vec::new();

    while let Some(entry) = dir.next_entry().await? {
        let file_name = entry
            .file_name()
            .into_string()
            .map_err(|err| eyre!("error {:?}", err))?;

        let file_path = is_image(entry.path());

        match file_path {
            Some(file_path) => {
                if let Ok(img_data) = read(file_path).await {
                    files_path.push((Arc::new(file_name), Arc::new(img_data)));
                }
            }
            None => eprintln!("INFO: not image file"),
        }
    }

    let _files_len = files_path.len();

    rayon::spawn(move || {
        let batch: Vec<_> = files_path
            .par_iter()
            .filter_map(move |(path, data)| {
                let path = Arc::clone(path);
                let data = Arc::clone(data);
                let cursor = Cursor::new(data.as_ref());

                let img_main = ImgReader::new(cursor)
                    .with_guessed_format()
                    .map_err(|err| eprintln!("Error: {err}"));

                match img_main {
                    Ok(img_main) => match img_main.decode() {
                        Ok(mut img_buff) => {
                            imageops::overlay(&mut img_buff, &wtr_buff, 2, 2);

                            let mut bytes = vec![];

                            match img_buff.write_to(&mut Cursor::new(&mut bytes), ImageFormat::Png)
                            {
                                Ok(_) => Some((path, Arc::new(bytes))),
                                Err(_) => None,
                            }
                        }
                        Err(_) => None,
                    },
                    Err(_) => None,
                }
            })
            .collect();
        let _ = tx.send(batch);
    });

    for (path_file, data) in recv.await? {
        let out_folder = Arc::clone(&out_folder);
        let handle = tauri::async_runtime::spawn(async move {
            let file_out = out_folder.join(path_file.as_ref());
            if let Ok(mut output_file) = File::create(&file_out).await {
                if let Ok(_save_res) = output_file.write_all(data.as_ref()).await {
                    println!("file output : {:?}", &file_out);
                }
            }
        });

        handles.push(handle);
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
    async fn test_rayon() -> eyre::Result<()> {
        let water_buffr = image::open(WM_PATH)?.to_rgba8();
        let path_src = Path::new(FOLDER_PATH);

        let res = multi_rayon(path_src, water_buffr).await;

        assert!(res.is_ok());

        Ok(())
    }
}
