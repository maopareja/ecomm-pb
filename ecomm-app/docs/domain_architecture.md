# Guía de Dominios y Multi-tenencia

Esta guía explica cómo funciona el sistema de dominios en **VetNexus**, las diferencias entre desarrollo local y producción, y cómo se ha asegurado la plataforma con HTTPS local.

## 1. Arquitectura de Ilimitados Subdominios (Multi-tenancy)

La aplicación utiliza una estrategia de "Wildcard Subdomains".

*   **Usuario Base**: `vetnexus.com` (Página principal, Login, Registro).
*   **Tenants (Clientes)**: `alma.vetnexus.com`, `clinica-norte.vetnexus.com`, etc.

### ¿Cómo funciona técnicamente?
No se crea un servidor ni una carpeta por cada usuario. Es el **mismo código** sirviendo a todos.
1.  **DNS Wildcard**: Todo lo que sea `*.vetnexus.com` apunta a la **misma IP** (tu servidor).
2.  **Frontend (Middleware)**: Next.js detecta el subdominio (`alma`) en la URL.
3.  **Backend**: Identifica al "Tenant" basándose en ese subdominio y filtra la base de datos para mostrar solo la información de "Alma".

---

## 2. Entorno Local vs. Producción

Aquí es donde radica la confusión común. Tu computadora no es un servidor DNS de internet, por lo que no entiende "magicamente" que `alma.vetnexus.local` eres tú mismo.

### HTTPS Local (`.vetnexus.local`)
Hemos configurado **HAProxy** con certificados generados por `mkcert`.

#### Proceso de Generación de Certificados
Para simular un entorno seguro localmente, usamos `mkcert` que crea una autoridad certificadora (CA) local confiable.

1.  **Instalación**:
    ```bash
    brew install mkcert nss  # macOS
    mkcert -install          # Instala la CA en el sistema y navegadores
    ```

2.  **Generación**:
    Creamos un certificado válido para el dominio principal, el wildcard y localhost:
    ```bash
    cd haproxy/certs
    mkcert vetnexus.local "*.vetnexus.local" localhost 127.0.0.1
    ```

3.  **Preparación para HAProxy**:
    HAProxy requiere que el certificado y la clave privada estén en un solo archivo `.pem`.
    ```bash
    cat vetnexus.local+3.pem vetnexus.local+3-key.pem > vetnexus.pem
    ```
    Este archivo `vetnexus.pem` es el que finalmente montamos en el contenedor de HAProxy.

4.  **Resultado**: Puedes navegar a `https://vetnexus.local` y verás el candado verde 🔒.

### Entorno Producción (`.vetnexus.com`)
En producción **NO** tocas archivos hosts. Todo es automático.
1.  **Compra de Dominio**: Tienes `vetnexus.com`.
2.  **Registro DNS Tipo A (Wildcard)**:
    *   Nombre: `*` (asterisco).
    *   Valor: `IP_DE_TU_VPS`.
3.  **Resultado**: Si alguien escribe `loquesea.vetnexus.com`, el DNS mundial lo envía a tu IP. HAProxy lo recibe, Next.js lee "loquesea" y muestra la tienda correcta. **Cero configuración manual por usuario.**

---

## 3. Seguridad Implementada

Hemos realizado cambios importantes para asegurar la aplicación:

1.  **Cookies Dinámicas**:
    *   Antes: Las cookies se fijaban a `.vetnexus.local` (error en producción).
    *   Ahora: El backend lee `DOMAIN` de `config.py` o variables de entorno.
        *   Local: usa `.vetnexus.local`.
        *   Prod: usará `.vetnexus.com`.

2.  **Flags de Seguridad (Secure Cookie)**:
    *   Agregamos `COOKIE_SECURE`.
    *   Local: `False` (o `True` si usas el nuevo HTTPS local que configuramos).
    *   Producción: **SIEMPRE `True`**. Esto impide que las cookies de sesión viajen por HTTP inseguro, protegiendo contra robos de sesión.

## 4. Próximos Pasos (Despliegue)

Cuando subas esto a un VPS:
1.  En el archivo `.env` del servidor:
    ```bash
    DOMAIN=.vetnexus.com
    COOKIE_SECURE=True
    ```
2.  Configura el DNS `*` apuntando al VPS.
3.  Usa **Certbot (Let's Encrypt)** en el HAProxy de producción para obtener un certificado real wildcard (gratuito) para `*.vetnexus.com`.
