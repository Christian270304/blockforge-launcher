use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[tauri::command]
fn get_total_memory() -> u64 {
    let mut sys = sysinfo::System::new_all();

    sys.refresh_memory();

    sys.total_memory()
}

// =========================================================
// CONFIG
// =========================================================

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LauncherConfig {
    ram: u64,
    close_on_launch: bool,
    auto_update: bool,
}


impl Default for LauncherConfig {

    fn default() -> Self {

        Self {
            ram: 8,
            close_on_launch: false,
            auto_update: true,
        }

    }

}


// =========================================================
// CONFIG PATH
// =========================================================

fn get_config_path() -> Result<PathBuf, String> {

    let appdata = std::env::var("APPDATA")
        .map_err(|_| "No se pudo encontrar AppData".to_string())?;

    let folder = PathBuf::from(appdata)
        .join("BlockForge");

    fs::create_dir_all(&folder)
        .map_err(|e| e.to_string())?;

    Ok(folder.join("config.json"))
}


// =========================================================
// LOAD CONFIG
// =========================================================

#[tauri::command]
fn load_config() -> Result<LauncherConfig, String> {

    let path = get_config_path()?;

    if !path.exists() {

        let config = LauncherConfig::default();

        let json = serde_json::to_string_pretty(&config)
            .map_err(|e| e.to_string())?;

        fs::write(&path, json)
            .map_err(|e| e.to_string())?;

        return Ok(config);
    }

    let json = fs::read_to_string(&path)
        .map_err(|e| e.to_string())?;

    let config: LauncherConfig =
        serde_json::from_str(&json)
            .map_err(|e| e.to_string())?;

    Ok(config)
}


// =========================================================
// SAVE CONFIG
// =========================================================

#[tauri::command]
fn save_config(config: LauncherConfig) -> Result<(), String> {

    let path = get_config_path()?;

    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| e.to_string())?;

    fs::write(path, json)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_total_memory,
            load_config,
            save_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}