#!/bin/bash

# Script de empaquetado para Smart TV Apps
# Genera paquetes instalables para Samsung Tizen (.wgt) y LG webOS (.ipk)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦  Smart TV App Packager${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

PLATFORM=${1:-all}

# Función para limpiar directorios temporales
cleanup() {
    echo -e "${YELLOW}🧹 Limpiando directorios temporales...${NC}"
    rm -rf .tmp-tizen .tmp-webos
}

# Función para crear iconos placeholder si no existen
create_placeholder_icons() {
    echo -e "${YELLOW}📝 Verificando iconos...${NC}"

    if [ ! -f "public/icon.png" ]; then
        echo -e "${RED}⚠️  No se encontró public/icon.png${NC}"
        echo -e "${YELLOW}   Creando icono placeholder...${NC}"

        # Crear un icono SVG simple y convertirlo
        cat > public/icon.svg <<'EOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3b82f6"/>
  <text x="256" y="280" font-size="200" fill="white" text-anchor="middle" font-family="Arial">TV</text>
</svg>
EOF
        echo -e "${GREEN}   ✓ Icono placeholder creado${NC}"
        echo -e "${YELLOW}   Reemplaza public/icon.png con tu logo${NC}"
    fi
}

# Build de la aplicación
build_app() {
    echo -e "${YELLOW}🔨 Building aplicación web...${NC}"
    npm run build
    echo -e "${GREEN}✓ Build completado${NC}\n"
}

# Empaquetar para Samsung Tizen
package_tizen() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📱 Empaquetando para Samsung Tizen${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    # Crear directorio temporal
    mkdir -p .tmp-tizen

    # Copiar archivos del build
    echo -e "${YELLOW}📋 Copiando archivos...${NC}"
    cp -r dist/* .tmp-tizen/

    # Copiar config.xml
    cp public/tizen/config.xml .tmp-tizen/

    # Copiar icono (o usar placeholder)
    if [ -f "public/icon.png" ]; then
        cp public/icon.png .tmp-tizen/icon.png
    fi

    echo -e "${GREEN}✓ Archivos preparados en .tmp-tizen/${NC}\n"

    # Intentar empaquetar con tizen CLI
    if command -v tizen &> /dev/null; then
        echo -e "${YELLOW}🎁 Creando paquete .wgt...${NC}"
        cd .tmp-tizen
        tizen package -t wgt -- .
        cd ..

        # Mover el paquete generado
        if [ -f ".tmp-tizen"/*.wgt ]; then
            mkdir -p packages
            mv .tmp-tizen/*.wgt packages/checador-empresa-tizen.wgt
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}✓ Paquete Tizen creado: packages/checador-empresa-tizen.wgt${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        fi
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠️  Tizen CLI no está instalado${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        echo -e "${BLUE}Los archivos están listos en: .tmp-tizen/${NC}"
        echo -e "${BLUE}Para empaquetar manualmente:${NC}\n"
        echo -e "  1. Instala Tizen Studio o tizen-cli"
        echo -e "  2. Ejecuta: cd .tmp-tizen && tizen package -t wgt -- .\n"
        echo -e "${YELLOW}O empaqueta manualmente:${NC}"
        echo -e "  - Comprime .tmp-tizen/* en un archivo .zip"
        echo -e "  - Renombra la extensión de .zip a .wgt"
        echo -e "  - El archivo .wgt ya es instalable en Samsung TV\n"
    fi
}

# Empaquetar para LG webOS
package_webos() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📱 Empaquetando para LG webOS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    # Crear directorio temporal
    mkdir -p .tmp-webos

    # Copiar archivos del build
    echo -e "${YELLOW}📋 Copiando archivos...${NC}"
    cp -r dist/* .tmp-webos/

    # Copiar appinfo.json
    cp public/webos/appinfo.json .tmp-webos/

    # Copiar iconos (o usar placeholder)
    if [ -f "public/icon.png" ]; then
        cp public/icon.png .tmp-webos/icon.png
        cp public/icon.png .tmp-webos/icon-large.png
    fi

    echo -e "${GREEN}✓ Archivos preparados en .tmp-webos/${NC}\n"

    # Intentar empaquetar con ares-package
    if command -v ares-package &> /dev/null; then
        echo -e "${YELLOW}🎁 Creando paquete .ipk...${NC}"
        mkdir -p packages
        ares-package .tmp-webos -o packages

        if [ -f packages/*.ipk ]; then
            # Renombrar para nombre más amigable
            mv packages/com.tuempresa.checador_*.ipk packages/checador-empresa-webos.ipk 2>/dev/null || true
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}✓ Paquete webOS creado: packages/checador-empresa-webos.ipk${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        fi
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠️  webOS CLI (ares-package) no está instalado${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        echo -e "${BLUE}Los archivos están listos en: .tmp-webos/${NC}"
        echo -e "${BLUE}Para empaquetar manualmente:${NC}\n"
        echo -e "  1. Instala webOS CLI:"
        echo -e "     npm install -g @webosose/ares-cli"
        echo -e "  2. Ejecuta:"
        echo -e "     ares-package .tmp-webos -o packages\n"
    fi
}

# Main
main() {
    # Crear iconos si no existen
    create_placeholder_icons

    # Build
    build_app

    # Empaquetar según plataforma
    case $PLATFORM in
        tizen)
            package_tizen
            ;;
        webos)
            package_webos
            ;;
        all)
            package_tizen
            package_webos
            ;;
        *)
            echo -e "${RED}❌ Plataforma desconocida: $PLATFORM${NC}"
            echo -e "${YELLOW}Uso: ./package-tv.sh [tizen|webos|all]${NC}"
            exit 1
            ;;
    esac

    # Mostrar resumen
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✨ Empaquetado completado${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    if [ -d "packages" ]; then
        echo -e "${YELLOW}📦 Paquetes generados:${NC}"
        ls -lh packages/
        echo ""
    fi

    echo -e "${YELLOW}📖 Próximos pasos:${NC}"
    echo -e "   1. Habilita modo desarrollador en tu Smart TV"
    echo -e "   2. Instala el paquete correspondiente:"
    echo -e "      ${BLUE}Samsung:${NC} tizen install -n packages/checador-empresa-tizen.wgt"
    echo -e "      ${BLUE}LG:${NC} ares-install packages/checador-empresa-webos.ipk -d [TV_NAME]"
    echo -e "\n${YELLOW}📚 Ver guía completa:${NC} DEPLOYMENT.md\n"

    # Preguntar si limpiar
    read -p "¿Eliminar directorios temporales? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup
        echo -e "${GREEN}✓ Limpieza completada${NC}\n"
    else
        echo -e "${BLUE}ℹ️  Directorios temporales conservados para inspección${NC}\n"
    fi
}

# Ejecutar
main
