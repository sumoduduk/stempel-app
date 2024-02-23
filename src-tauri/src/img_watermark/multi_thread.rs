use std::{
    path::{Path, PathBuf},
    sync::Arc,
    thread,
};

use image::{imageops, DynamicImage};

use crate::{
    file_operation::{create_folder, get_filename},
    scale_image::begin_scale,
    utils::get_seconds,
};

pub fn multi_thread_opr(
    folder_path: &Path,
    images: Vec<PathBuf>,
    water_buffr: &DynamicImage,
    wtr_scale: (u32, u32),
    _img_dim: (u32, u32),
    coordinate: (i64, i64),
) {
    let seconds = get_seconds();
    let folder_name = format!("watermark_{seconds}");
    let out_folder = Arc::new(folder_path.join(&folder_name));
    let water_scale = Arc::new(begin_scale(
        water_buffr,
        wtr_scale.0,
        wtr_scale.1,
        imageops::FilterType::Nearest,
    ));

    create_folder(&out_folder);

    let mut handles = vec![];

    for img_path in images {
        let out_folder = Arc::clone(&out_folder);
        let water_scale = Arc::clone(&water_scale);

        let handle = thread::spawn(move || {
            let image_main = image::open(&img_path);

            match image_main {
                Ok(mut image_main) => {
                    imageops::overlay(
                        &mut image_main,
                        water_scale.as_ref(),
                        coordinate.0,
                        coordinate.1,
                    );

                    let file_name = get_filename(&img_path);

                    match file_name {
                        Some(file_name) => {
                            let file_out = out_folder.join(file_name);

                            let _ = image_main.save(&file_out);

                            println!("file output : {:?}", &file_out);
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
    use image::GenericImageView;

    use super::*;
    use std::path::Path;
    use std::time::Instant;

    use crate::file_operation::read_folder;

    const WM_PATH: &str = "/home/calista/Pictures/tauri_logo.png";
    const FOLDER_PATH: &str = "/home/calista/Pictures/img-robo/";

    #[test]
    fn test_multi_thread() -> eyre::Result<()> {
        let folder_path = Path::new(FOLDER_PATH);
        dbg!(folder_path);
        let img_dim = (0, 0);
        let coordinate = (0, 0);
        let start = Instant::now();
        let images = read_folder(&folder_path).expect("ERROR: should read folder tes");
        let water_buffr = image::open(WM_PATH)?;
        let wtr_scale = water_buffr.dimensions();
        let duration_read = start.elapsed();
        println!("TEST: Read duration : {:#?}", duration_read);

        multi_thread_opr(
            folder_path,
            images,
            &water_buffr,
            wtr_scale,
            img_dim,
            coordinate,
        );

        let duration = start.elapsed();
        println!("TEST: Time duration finish : {:#?}", duration);

        Ok(())
    }
}
