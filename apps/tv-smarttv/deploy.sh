#!/bin/bash

# Script de despliegue para Smart TV Webapp
# Uso: ./deploy.sh [method]
# Methods: serve, tizen, webos, info

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📺  Smart TV Webapp - Deployment Tool${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Detectar IP local
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    LOCAL_IP=$(ipconfig | grep "IPv4" | grep -v "127.0.0.1" | head -n 1 | awk '{print $NF}')
else
    # Linux/Mac
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

METHOD=${1:-info}

case $METHOD in
    serve)
        echo -e "${GREEN}🚀 Iniciando servidor web local...${NC}\n"

        # Build
        echo -e "${YELLOW}📦 Building application...${NC}"
        npm run build

        echo -e "\n${GREEN}✓ Build completado${NC}"
        echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✓ Servidor iniciado${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        echo -e "${YELLOW}📱 Accede desde tu Smart TV:${NC}"
        echo -e "   ${GREEN}http://${LOCAL_IP}:3000${NC}\n"

        echo -e "${YELLOW}📋 Pasos:${NC}"
        echo -e "   1. Abre el navegador web en tu Smart TV"
        echo -e "   2. Navega a: ${GREEN}http://${LOCAL_IP}:3000${NC}"
        echo -e "   3. ¡Disfruta!\n"

        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        # Iniciar servidor
        npx serve dist -l 3000 --cors
        ;;

    tizen)
        echo -e "${GREEN}📦 Empaquetando para Samsung Tizen...${NC}\n"

        # Build
        npm run build

        echo -e "${YELLOW}📝 Creando paquete .wgt...${NC}"
        cd dist

        if command -v tizen &> /dev/null; then
            tizen package -t wgt -- .
            echo -e "\n${GREEN}✓ Paquete creado: checador.wgt${NC}"
            echo -e "\n${YELLOW}Para instalar en tu Samsung TV:${NC}"
            echo -e "   tizen connect ${LOCAL_IP}"
            echo -e "   tizen install -n checador.wgt"
            echo -e "   tizen run -p abcdefghij.checador"
        else
            echo -e "\n${RED}❌ Error: 'tizen' CLI no está instalado${NC}"
            echo -e "${YELLOW}Instala Tizen Studio desde:${NC}"
            echo -e "   https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk.html"
        fi
        ;;

    webos)
        echo -e "${GREEN}📦 Empaquetando para LG webOS...${NC}\n"

        # Build
        npm run build

        echo -e "${YELLOW}📝 Creando paquete .ipk...${NC}"

        if command -v ares-package &> /dev/null; then
            ares-package dist -o ./
            echo -e "\n${GREEN}✓ Paquete creado: com.tuempresa.checador_1.0.0_all.ipk${NC}"
            echo -e "\n${YELLOW}Para instalar en tu LG TV:${NC}"
            echo -e "   ares-setup-device (primera vez)"
            echo -e "   ares-install com.tuempresa.checador_1.0.0_all.ipk -d [TV_NAME]"
            echo -e "   ares-launch com.tuempresa.checador -d [TV_NAME]"
        else
            echo -e "\n${RED}❌ Error: 'ares-cli' no está instalado${NC}"
            echo -e "${YELLOW}Instala webOS TV CLI:${NC}"
            echo -e "   npm install -g @webosose/ares-cli"
        fi
        ;;

    info|*)
        echo -e "${GREEN}ℹ️  Información del proyecto${NC}\n"

        if [ -d "dist" ]; then
            SIZE=$(du -sh dist/ | awk '{print $1}')
            echo -e "${YELLOW}📦 Build:${NC} Listo (${SIZE})"
        else
            echo -e "${YELLOW}📦 Build:${NC} No generado aún"
            echo -e "   ${BLUE}Ejecuta:${NC} npm run build"
        fi

        echo -e "\n${YELLOW}🌐 Tu IP local:${NC} ${GREEN}${LOCAL_IP}${NC}"
        echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}🚀 Métodos de despliegue disponibles:${NC}\n"

        echo -e "${GREEN}1. Servidor Web Local${NC} ${BLUE}(Recomendado)${NC}"
        echo -e "   ${BLUE}./deploy.sh serve${NC}"
        echo -e "   Accede desde: ${GREEN}http://${LOCAL_IP}:3000${NC}"
        echo -e "   ✓ Compatible con TODAS las Smart TVs\n"

        echo -e "${GREEN}2. Samsung Tizen${NC} ${BLUE}(App Nativa)${NC}"
        echo -e "   ${BLUE}./deploy.sh tizen${NC}"
        echo -e "   Crea paquete .wgt para instalar en Samsung TV\n"

        echo -e "${GREEN}3. LG webOS${NC} ${BLUE}(App Nativa)${NC}"
        echo -e "   ${BLUE}./deploy.sh webos${NC}"
        echo -e "   Crea paquete .ipk para instalar en LG TV\n"

        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}📖 Documentación completa:${NC} DEPLOYMENT.md"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        ;;
esac
