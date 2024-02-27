use image::DynamicImage;
use std::path::Path;

pub fn wm_load_file(water_path: &Path) -> eyre::Result<DynamicImage> {
    let wtr_buffer = image::open(water_path)?;
    Ok(wtr_buffer)
}
