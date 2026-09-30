# Recursos de la Aplicación

Coloca aquí los iconos de la aplicación:

## Iconos Requeridos

### Windows
- **icon.ico** - Ícono de la aplicación (256x256 o múltiples tamaños en un archivo .ico)
  - Puedes generar un .ico desde una imagen PNG usando: https://icoconvert.com/

### macOS
- **icon.icns** - Ícono de la aplicación (512x512 y otros tamaños)
  - Puedes generar un .icns usando: https://cloudconvert.com/png-to-icns

### Linux
- **icon.png** - Ícono de la aplicación (512x512 PNG)

## Herramientas Recomendadas

- **Electron Icon Maker**: https://www.electron.build/icons
- **Icon Generator**: https://icon.kitchen/

## Crear Iconos Rápidamente

Si tienes un logo/imagen de tu empresa:

1. Redimensiona a 1024x1024 PNG
2. Usa https://www.electronforge.io/guides/create-and-add-icons
3. O usa: `npx electron-icon-builder --input=./logo.png --output=./electron/resources/`

Por ahora, la app funcionará sin iconos (usará el ícono predeterminado de Electron).
