# Guía de Build - E-Commerce App

## ⚠️ IMPORTANTE: Construcción del Frontend

El frontend de Next.js necesita que la variable `NEXT_PUBLIC_BASE_PATH` se **imprima en tiempo de BUILD** en el código JavaScript del navegador.

### Problema Común

Si ves errores 503 en las llamadas API (ej. `GET /api/products`), es porque `NEXT_PUBLIC_BASE_PATH` no se compiló correctamente en el bundle.

### Solución Rápida (Local)

```bash
# 1. Detener contenedores
docker compose down

# 2. Borrar imagen del frontend
docker rmi ecomm-app-frontend

# 3. Reconstruir con argumento explícito
docker compose build --build-arg NEXT_PUBLIC_BASE_PATH=/prjzdev1092 frontend

# 4. Levantar
docker compose up
```

### Configuración Estándar (Ya aplicada)

El archivo `docker-compose.yml` ya tiene la configuración correcta:

```yaml
frontend:
  build:
    context: ./frontend
    args:
      NEXT_PUBLIC_BASE_PATH: /prjzdev1092  # ← Build argument
  environment:
    - NEXT_PUBLIC_BASE_PATH=/prjzdev1092   # ← Runtime env (para referencia)
```

**NOTA:** `NEXT_PUBLIC_BASE_PATH` se usa:
- En **build time**: Next.js reemplaza `process.env.NEXT_PUBLIC_BASE_PATH` en el código con el valor literal
- En **runtime**: Solo como referencia en variables de entorno del contenedor

### Para Producción (VPS)

El mismo comando funciona:

```bash
docker compose build --build-arg NEXT_PUBLIC_BASE_PATH=/prjzdev1092 frontend
docker compose up -d
```

O simplemente:

```bash
docker compose up -d --build
```

(Usará los `args` del `docker-compose.yml` automáticamente)

### ¿Por qué pasó esto?

1. **Next.js reemplaza variables en build:** `process.env.NEXT_PUBLIC_BASE_PATH` se convierte en `"/prjzdev1092"` literalmente en el JavaScript compilado.
2. **Caché de Docker:** Si la imagen ya existía y no se invalidó el caché de la capa `npm run build`, el código viejo (con valor incorrecto) permanecía.
3. **Reconstrucción manual con `--build-arg`:** Forzó la invalidación del caché y reconstruyó correctamente.

---

**Regla de oro:** Cada vez que cambies `NEXT_PUBLIC_BASE_PATH`, DEBES reconstruir el frontend desde cero.
