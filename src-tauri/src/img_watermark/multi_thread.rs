use std::{
    path::{Path, PathBuf},
    sync::{mpsc::Sender, Arc},
    thread,
};

use image::imageops;

use crate::{
    file_operation::{create_folder, get_filename},
    utils::get_seconds,
};

use super::ImgBuf;

pub fn multi_thread_opr(
    folder_path: &Path,
    images: Vec<PathBuf>,
    water_buffr: ImgBuf,
    coordinate: (i64, i64),
    sender: Sender<u8>,
) {
    let seconds = get_seconds();
    let folder_name = format!("watermark_{seconds}");
    let out_folder = Arc::new(folder_path.join(&folder_name));
    let water_scale = Arc::new(water_buffr);

    create_folder(&out_folder);

    let mut handles = vec![];

    for img_path in images {
        let out_folder = Arc::clone(&out_folder);
        let water_scale = Arc::clone(&water_scale);

        let sender = sender.clone();

        let handle = thread::spawn(move || {
            let image_main = image::open(&img_path);

            let _ = sender.send(1);
            match image_main {
                Ok(mut image_main) => {
                    let wtr_mark = water_scale.as_ref();
                    imageops::overlay(&mut image_main, wtr_mark, coordinate.0, coordinate.1);
                    let _ = sender.send(1);

                    let file_name = get_filename(&img_path);

                    match file_name {
                        Some(file_name) => {
                            let file_out = out_folder.join(file_name);
                            let _ = sender.send(1);

                            let _ = image_main.save(&file_out);

                            println!("file output : {:?}", &file_out);
                            let _ = sender.send(1);
                        }
                        None => println!(
                            "ERROR: get filename {img_path}",
                            img_path = img_path.display()
                        ),
                    }
                }
                Err(err) => println!("ERROR : open image in {err}"),
            }
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().expect("ERROR: join handle")
    }
}

#[cfg(test)]
mod test {

    use super::*;
    use std::path::Path;
    use std::sync::mpsc::channel;
    use std::time::Instant;

    use crate::file_operation::read_folder;

    const WM_PATH: &str = "/home/calista/Pictures/tauri_logo.png";
    const FOLDER_PATH: &str = "/home/calista/Pictures/test/";

    #[test]
    fn test_multi_thread() -> eyre::Result<()> {
        let folder_path = Path::new(FOLDER_PATH);
        dbg!(folder_path);
        let coordinate = (0, 0);
        let start = Instant::now();
        let images = read_folder(&folder_path).expect("ERROR: should read folder tes");
        let water_buffr = image::open(WM_PATH)?.to_rgba8();
        let duration_read = start.elapsed();
        println!("TEST: Read duration : {:#?}", duration_read);

        let (tx, _) = channel();

        multi_thread_opr(folder_path, images, water_buffr, coordinate, tx);

        let duration = start.elapsed();
        println!("TEST: Time duration finish : {:#?}", duration);

        Ok(())
    }
}
