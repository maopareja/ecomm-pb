# Guía para Renombrar el Proyecto VetNexus

Esta guía documenta todos los cambios necesarios para renombrar el proyecto "VetNexus" a un nuevo nombre.

## Variables a Definir

Antes de comenzar, definir:
- **NUEVO_NOMBRE**: Nombre del proyecto (ej: "PetCare")
- **NUEVO_DOMINIO**: Dominio base (ej: "petcare")
- **NUEVO_DIR**: Nombre del directorio raíz (ej: "petcare-shopy")

---

## 1. Archivos de Configuración Backend

### `backend/app/config.py`

**Línea 11:**
```python
# ANTES:
DOMAIN: str = ".vetnexus.local"  # Default for local dev

# DESPUÉS:
DOMAIN: str = ".{NUEVO_DOMINIO}.local"  # Default for local dev
```

### `backend/app/main.py`

**Línea 14:**
```python
# ANTES:
allow_origin_regex=r"http://.*\\.?(localhost|vetnexus\\.local)",

# DESPUÉS:
allow_origin_regex=r"http://.*\\.?(localhost|{NUEVO_DOMINIO}\\.local)",
```

---

## 2. Archivos Frontend (Next.js)

### `frontend/middleware.ts`

**Línea 29:**
```typescript
// ANTES:
const mainDomains = ["localhost", "www.localhost", "vetnexus-shopy", "vetnexus.local", "www.vetnexus.local"]

// DESPUÉS:
const mainDomains = ["localhost", "www.localhost", "{NUEVO_DIR}", "{NUEVO_DOMINIO}.local", "www.{NUEVO_DOMINIO}.local"]
```

### `frontend/app/page.tsx`

**Línea 41:**
```typescript
// ANTES:
const redirectUrl = `http://${data.tenant_slug}.vetnexus.local/modules/select`;

// DESPUÉS:
const redirectUrl = `http://${data.tenant_slug}.{NUEVO_DOMINIO}.local/modules/select`;
```

**Línea 51:**
```typescript
// ANTES:
const redirectUrl = `http://${data.tenant_slug}.vetnexus.local/`;

// DESPUÉS:
const redirectUrl = `http://${data.tenant_slug}.{NUEVO_DOMINIO}.local/`;
```

**Línea 57:**
```typescript
// ANTES:
const redirectUrl = `http://${data.tenant_slug}.vetnexus.local/modules/select`;

// DESPUÉS:
const redirectUrl = `http://${data.tenant_slug}.{NUEVO_DOMINIO}.local/modules/select`;
```

**Línea 78 (Branding - Logo):**
```tsx
// ANTES:
<span className="font-bold text-xl tracking-tight">VetNexus</span>

// DESPUÉS:
<span className="font-bold text-xl tracking-tight">{NUEVO_NOMBRE}</span>
```

**Línea 194 (Copyright):**
```tsx
// ANTES:
<p>&copy; 2026 VetNexus Inc.</p>

// DESPUÉS:
<p>&copy; 2026 {NUEVO_NOMBRE} Inc.</p>
```

### `frontend/app/sites/[site]/page.tsx`

**Línea 293:**
```typescript
// ANTES:
<Link href="http://vetnexus.local" className="text-sm font-bold border-b border-black">Volver al inicio</Link>

// DESPUÉS:
<Link href="http://{NUEVO_DOMINIO}.local" className="text-sm font-bold border-b border-black">Volver al inicio</Link>
```

### `frontend/app/modules/home/page.tsx`

**Líneas 27 y 32:**
```javascript
// ANTES:
window.location.href = "http://vetnexus.local?mode=login";

// DESPUÉS:
window.location.href = "http://{NUEVO_DOMINIO}.local?mode=login";
```

---

## 3. Infraestructura y Certificados SSL

### `haproxy/haproxy.cfg`

**Línea 14:**
```
# ANTES:
bind *:443 ssl crt /usr/local/etc/haproxy/certs/vetnexus.pem

# DESPUÉS:
bind *:443 ssl crt /usr/local/etc/haproxy/certs/{NUEVO_DOMINIO}.pem
```

### Regenerar Certificados SSL

Ejecutar en el directorio `haproxy/certs/`:

```bash
# 1. Generar nuevos certificados con mkcert
mkcert {NUEVO_DOMINIO}.local "*.{NUEVO_DOMINIO}.local" localhost 127.0.0.1

# 2. Combinar certificado y clave privada
cat {NUEVO_DOMINIO}.local+3.pem {NUEVO_DOMINIO}.local+3-key.pem > {NUEVO_DOMINIO}.pem

# 3. (Opcional) Eliminar archivos intermedios
rm {NUEVO_DOMINIO}.local+3.pem {NUEVO_DOMINIO}.local+3-key.pem

# 4. (Opcional) Eliminar certificados antiguos
rm vetnexus.pem
```

---

## 4. Configuración del Sistema

### Archivo `/etc/hosts`

Actualizar todas las entradas de dominios locales:

```bash
# ANTES:
127.0.0.1 vetnexus.local
127.0.0.1 www.vetnexus.local
127.0.0.1 alma.vetnexus.local
# ... otros tenants

# DESPUÉS:
127.0.0.1 {NUEVO_DOMINIO}.local
127.0.0.1 www.{NUEVO_DOMINIO}.local
127.0.0.1 alma.{NUEVO_DOMINIO}.local
# ... otros tenants con el nuevo dominio
```

Para editar `/etc/hosts`:
```bash
sudo nano /etc/hosts
```

---

## 5. Variables de Entorno

### Backend: `backend/.env`

Crear o actualizar:
```env
# Desarrollo local
DOMAIN=.{NUEVO_DOMINIO}.local

# Para producción (cuando esté listo)
# DOMAIN=.{NUEVO_DOMINIO}.com
```

### Frontend: `frontend/.env.local`

Crear o actualizar:
```env
NEXT_PUBLIC_DOMAIN={NUEVO_DOMINIO}.local
```

---

## 6. Directorio del Proyecto

Renombrar el directorio raíz:

```bash
# Detener servicios de Docker
cd /Users/maopareja/gemini/vetnexus-shopy
docker compose down

# Ir al directorio padre
cd /Users/maopareja/gemini

# Renombrar directorio
mv vetnexus-shopy {NUEVO_DIR}

# Entrar al nuevo directorio
cd {NUEVO_DIR}

# Reiniciar servicios
docker compose up -d
```

---

## 7. Documentación

### `docs/domain_architecture.md`

Actualizar todas las referencias a:
- `vetnexus.com` → `{NUEVO_DOMINIO}.com`
- `vetnexus.local` → `{NUEVO_DOMINIO}.local`
- `VetNexus` → `{NUEVO_NOMBRE}`

Específicamente en líneas: 3, 9, 10, 14, 22, 24, 40, 46, 48, 50, 52, 54, 58, 67, 69, 70, 82, 86

---

## Script de Migración Automatizado

Crear un script `rename_project.sh` en la raíz del proyecto:

```bash
#!/bin/bash

# ============================================
# Script de Migración - Renombrar VetNexus
# ============================================

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Script de Renombrado de Proyecto ===${NC}\n"

# Solicitar nueva información
read -p "Nombre del proyecto (ej: PetCare): " NUEVO_NOMBRE
read -p "Dominio base (ej: petcare): " NUEVO_DOMINIO
read -p "Nombre del directorio (ej: petcare-shopy): " NUEVO_DIR

echo -e "\n${YELLOW}Confirmación:${NC}"
echo "  - Nombre: $NUEVO_NOMBRE"
echo "  - Dominio: $NUEVO_DOMINIO"
echo "  - Directorio: $NUEVO_DIR"
read -p "¿Continuar? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ]; then
    echo -e "${RED}Operación cancelada.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Iniciando migración...${NC}\n"

# 1. Backend - config.py
echo "1. Actualizando backend/app/config.py..."
sed -i '' "s/DOMAIN: str = \"\\.vetnexus\\.local\"/DOMAIN: str = \".$NUEVO_DOMINIO.local\"/" backend/app/config.py

# 2. Backend - main.py
echo "2. Actualizando backend/app/main.py..."
sed -i '' "s/vetnexus\\\\\\\\.local/$NUEVO_DOMINIO\\\\\\\\.local/" backend/app/main.py

# 3. Frontend - middleware.ts
echo "3. Actualizando frontend/middleware.ts..."
sed -i '' "s/\"vetnexus-shopy\"/\"$NUEVO_DIR\"/" frontend/middleware.ts
sed -i '' "s/\"vetnexus\\.local\"/\"$NUEVO_DOMINIO.local\"/" frontend/middleware.ts
sed -i '' "s/\"www\\.vetnexus\\.local\"/\"www.$NUEVO_DOMINIO.local\"/" frontend/middleware.ts

# 4. Frontend - page.tsx (principal)
echo "4. Actualizando frontend/app/page.tsx..."
sed -i '' "s/\\.vetnexus\\.local/.$NUEVO_DOMINIO.local/g" frontend/app/page.tsx
sed -i '' "s/>VetNexus</>$NUEVO_NOMBRE</g" frontend/app/page.tsx
sed -i '' "s/VetNexus Inc\./$NUEVO_NOMBRE Inc./g" frontend/app/page.tsx

# 5. Frontend - sites/[site]/page.tsx
echo "5. Actualizando frontend/app/sites/[site]/page.tsx..."
sed -i '' "s/vetnexus\\.local/$NUEVO_DOMINIO.local/g" frontend/app/sites/[site]/page.tsx

# 6. Frontend - modules/home/page.tsx
echo "6. Actualizando frontend/app/modules/home/page.tsx..."
sed -i '' "s/vetnexus\\.local/$NUEVO_DOMINIO.local/g" frontend/app/modules/home/page.tsx

# 7. HAProxy
echo "7. Actualizando haproxy/haproxy.cfg..."
sed -i '' "s/vetnexus\\.pem/$NUEVO_DOMINIO.pem/" haproxy/haproxy.cfg

echo -e "\n${GREEN}✓ Archivos actualizados correctamente${NC}\n"

# Instrucciones manuales
echo -e "${YELLOW}=== PASOS MANUALES RESTANTES ===${NC}\n"

echo "1. Regenerar certificados SSL:"
echo "   cd haproxy/certs"
echo "   mkcert $NUEVO_DOMINIO.local \"*.$NUEVO_DOMINIO.local\" localhost 127.0.0.1"
echo "   cat $NUEVO_DOMINIO.local+3.pem $NUEVO_DOMINIO.local+3-key.pem > $NUEVO_DOMINIO.pem"
echo ""

echo "2. Actualizar /etc/hosts:"
echo "   sudo nano /etc/hosts"
echo "   Cambiar todas las líneas 'vetnexus.local' a '$NUEVO_DOMINIO.local'"
echo ""

echo "3. Reiniciar servicios Docker:"
echo "   docker compose down"
echo "   docker compose up -d"
echo ""

echo "4. (Opcional) Renombrar directorio del proyecto:"
echo "   cd .."
echo "   mv vetnexus-shopy $NUEVO_DIR"
echo ""

echo "5. Actualizar documentación en docs/domain_architecture.md"
echo ""

echo -e "${GREEN}¡Migración completada!${NC}"
```

---

## Checklist de Ejecución

- [ ] **Backup**: Hacer copia de seguridad del proyecto
- [ ] **Detener servicios**: `docker compose down`
- [ ] **Ejecutar script**: `bash rename_project.sh`
- [ ] **Regenerar certificados SSL** (ver sección 3)
- [ ] **Actualizar `/etc/hosts`** (ver sección 4)
- [ ] **Renombrar directorio** del proyecto (ver sección 6)
- [ ] **Actualizar documentación** (ver sección 7)
- [ ] **Crear variables de entorno** (ver sección 5)
- [ ] **Reiniciar servicios**: `docker compose up -d`
- [ ] **Probar acceso**: `http://{NUEVO_DOMINIO}.local`
- [ ] **Verificar redirecciones** de tenants
- [ ] **Verificar HTTPS** con certificado válido

---

## Notas Importantes

### Para Producción

Cuando se despliegue en producción con el nuevo nombre:

1. **Comprar dominio**: `{NUEVO_DOMINIO}.com`
2. **Configurar DNS wildcard**: `*.{NUEVO_DOMINIO}.com` → IP del servidor
3. **Obtener certificado SSL**: Usar Certbot con Let's Encrypt
   ```bash
   certbot certonly --standalone -d {NUEVO_DOMINIO}.com -d *.{NUEVO_DOMINIO}.com
   ```
4. **Actualizar variables de entorno**:
   ```env
   DOMAIN=.{NUEVO_DOMINIO}.com
   ```

### Consideraciones Adicionales

- **Base de datos**: Verificar si hay referencias hardcodeadas en datos existentes
- **S3/Storage**: Actualizar nombres de buckets si contienen "vetnexus"
- **Servicios externos**: APIs, webhooks, integraciones que usen el nombre actual
- **Repositorio Git**: Considerar renombrar el repositorio en GitHub/GitLab
- **Secrets**: Actualizar variables en servicios de CI/CD

---

## Soporte

Para dudas o problemas durante la migración, referirse a:
- `docs/domain_architecture.md` - Arquitectura de dominios
- `docker-compose.yml` - Configuración de servicios
- HAProxy logs: `docker compose logs haproxy`

---

**Última actualización**: 2026-01-27
