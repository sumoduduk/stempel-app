use std::time::{SystemTime, UNIX_EPOCH};

pub fn get_seconds() -> u64 {
    let current_time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let seconds = current_time.as_secs();
    seconds
}
