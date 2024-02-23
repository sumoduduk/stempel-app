use image::DynamicImage;
use std::path::Path;

pub fn base_load_file(base_path: &Path) -> eyre::Result<DynamicImage> {
    let wtr_buffer = image::open(base_path)?;
    Ok(wtr_buffer)
}
