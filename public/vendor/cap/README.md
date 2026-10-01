# Cap client assets

- `cap.min.js`: cap-widget 0.1.58
- `cap_wasm_bg.wasm`, `hashwx.wasm`: @cap.js/wasm 0.0.8
- `pako_inflate.min.js`: pako 2.1.0

Downloaded from the corresponding npm packages through cdn.jsdelivr.net.
The widget default WASM and pako URLs are changed to resolve beside
`cap.min.js`, using the script URL so subdirectory deployments work.
Custom `CAP_CUSTOM_WASM_URL`, `CAP_CUSTOM_HASHWX_URL`, and `CAP_PAKO_URL`
overrides remain supported. Keep these local defaults when updating the widget.
