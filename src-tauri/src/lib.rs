use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Setup System Tray Menu
            let toggle_item = MenuItem::with_id(app, "toggle", "Show / Hide Terminal", true, None::<&str>)?;
            let play_item = MenuItem::with_id(app, "play_pause", "Play / Pause", true, None::<&str>)?;
            let next_item = MenuItem::with_id(app, "next_track", "Next Track", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit SEVEN.FM", true, None::<&str>)?;

            let tray_menu = Menu::with_items(app, &[&toggle_item, &play_item, &next_item, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .tooltip("SEVEN.FM - Cyberpunk Terminal Audio")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle" => {
                        if let Some(window) = app.get_webview_window("main") {
                            if let Ok(visible) = window.is_visible() {
                                if visible {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                    }
                    "play_pause" => {
                        let _ = app.emit("media-toggle-play", ());
                    }
                    "next_track" => {
                        let _ = app.emit("media-next-track", ());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running SEVEN.FM desktop application");
}
