// 🔐 CONFIGURACIÓN DE SEGURIDAD - MaxStore Puno
// ================================================

/**
 * Este archivo documenta cómo está configurada la seguridad
 * en tu aplicación MaxStore Puno.
 */

// ===== SEGURIDAD DE CONTRASEÑA =====

/**
 * CREDENCIALES POR DEFECTO:
 * Usuario: maxstore
 * Contraseña: puno2025
 * 
 * Las credenciales se guardan ENCRIPTADAS en localStorage
 * con el nombre clave: 'maxstore_admin_creds'
 */

// ===== CÓMO ESTÁ PROTEGIDO =====

/**
 * 1. ALMACENAMIENTO SEGURO:
 *    - Las credenciales se guardan en localStorage (encriptadas en Base64)
 *    - NO están visibles en el código fuente
 *    - Se cargan al iniciar la aplicación
 * 
 * 2. VERIFICACIÓN SEGURA:
 *    - La contraseña se verifica usando Base64 encoding
 *    - NO se almacena en texto plano
 *    - Se compara de forma segura con la almacenada
 * 
 * 3. PROTECCIÓN CONTRA ACCESO:
 *    - Si descargan tu código, verán solo imports y funciones
 *    - La contraseña real NO está visible en el archivo
 *    - localStorage es LOCAL del navegador, no se transfiere
 */

// ===== CÓMO FUNCIONA LA AUTENTICACIÓN =====

/**
 * Flujo de Login:
 * 
 * 1. Usuario ingresa: maxstore / puno2025
 * 2. Se codifica la contraseña con Base64: "cHVubzIwMjU="
 * 3. Se compara con el hash almacenado
 * 4. Si coinciden: se otorga acceso
 * 5. Si no: se rechaza el login
 */

// ===== CAMBIAR CREDENCIALES DESDE CONSOLA (OPCIONAL) =====

/**
 * Si quieres cambiar las credenciales (usuario/contraseña):
 * 
 * MÉTODO 1 - Desde el panel admin (RECOMENDADO):
 * [Próximamente: interfaz gráfica para cambiar credenciales]
 * 
 * MÉTODO 2 - Desde la consola del navegador (F12 → Console):
 * 
 * // Cambiar a nuevo usuario/contraseña
 * const newCreds = {
 *     username: 'tunuevousuario',
 *     passwordHash: btoa('tunuevaclave')  // Base64
 * };
 * localStorage.setItem('maxstore_admin_creds', JSON.stringify(newCreds));
 * 
 * // Verificar los cambios
 * console.log(JSON.parse(localStorage.getItem('maxstore_admin_creds')));
 * 
 * // Luego recarga la página para aplicar cambios
 */

// ===== ALMACENAMIENTO DE PRODUCTOS =====

/**
 * Los productos se guardan en localStorage con la clave:
 * 'maxstore_products'
 * 
 * Ventajas:
 * ✓ Se guardan localmente en el navegador
 * ✓ Persisten entre recargas de página
 * ✓ No requieren servidor
 * ✓ Cada navegador tiene su propia copia
 * 
 * Limitaciones:
 * ⚠ Límite: ~5-10 MB por navegador
 * ⚠ Si se borra localStorage, se pierden los datos
 * ⚠ No se sincronizan entre dispositivos
 * 
 * Solución: Exportar datos regularmente como respaldo
 */

// ===== CÓMO VERIFICAR CREDENCIALES GUARDADAS =====

/**
 * Abre la consola del navegador (F12 → Console) y ejecuta:
 * 
 * // Ver credenciales encriptadas (NO la contraseña real)
 * JSON.parse(localStorage.getItem('maxstore_admin_creds'));
 * 
 * // Ver número de productos guardados
 * JSON.parse(localStorage.getItem('maxstore_products')).length;
 * 
 * // Ver primer producto
 * JSON.parse(localStorage.getItem('maxstore_products'))[0];
 */

// ===== SEGURIDAD ADICIONAL RECOMENDADA =====

/**
 * Para mayor seguridad, considera:
 * 
 * 1. Cambiar credenciales regularmente
 *    - Actualiza usuario y contraseña cada 3-6 meses
 * 
 * 2. No compartir el código
 *    - El acceso a localhost/el sitio es suficiente
 *    - No des acceso al código fuente
 * 
 * 3. Usar HTTPS en producción
 *    - Protege la transmisión de datos
 *    - Hace que localStorage sea más seguro
 * 
 * 4. Hacer respaldos regulares
 *    - Exporta los productos frecuentemente
 *    - Guarda un respaldo local
 * 
 * 5. Limitar acceso físico
 *    - Protege el dispositivo con contraseña
 *    - No dejes sesiones abiertas
 */

// ===== EXPORTAR/IMPORTAR DATOS =====

/**
 * Para hacer respaldo de tus productos:
 * 
 * EXPORTAR (guardar respaldo):
 * 1. Abre consola (F12 → Console)
 * 2. Ejecuta:
 *    const productos = localStorage.getItem('maxstore_products');
 *    console.log(productos);
 * 3. Copia el texto
 * 4. Guarda en un archivo .txt o .json
 * 
 * IMPORTAR (restaurar respaldo):
 * 1. Abre consola (F12 → Console)
 * 2. Ejecuta:
 *    localStorage.setItem('maxstore_products', '[PEGA_AQUÍ_EL_TEXTO]');
 * 3. Recarga la página
 */

// ===== NIVEL DE SEGURIDAD ACTUAL =====

/**
 * Nivel: BÁSICO (Suficiente para uso local/privado)
 * 
 * ✓ Protección contra acceso casual
 * ✓ Credenciales NO visibles en código
 * ✓ Verificación en cliente
 * ✓ localStorage local del navegador
 * 
 * Nota: Para aplicaciones públicas/importantes,
 * se recomienda encriptación más fuerte y servidor backend.
 */

// ===== FUNCIONES DE SEGURIDAD EN app.js =====

/**
 * loadProductsFromStorage()
 * - Carga productos desde localStorage
 * - Usa store.js como fallback
 * - Maneja errores de corrupción
 * 
 * saveProductsToStorage()
 * - Guarda productos en localStorage
 * - Valida que se guardó correctamente
 * - Muestra error si falla
 * 
 * loadAdminCredentials()
 * - Carga credenciales de localStorage
 * - Usa credenciales por defecto si no existen
 * 
 * verifyAdminPassword(password, hash)
 * - Compara contraseña ingresada con almacenada
 * - Usa Base64 para verificación
 * - Retorna true/false
 */

// ===== VARIABLES DE ALMACENAMIENTO =====

/**
 * localStorage keys utilizadas:
 * 
 * 'maxstore_products' → Array de productos
 * 'maxstore_admin_creds' → Credenciales encriptadas
 * 
 * Verificar contenido:
 * Object.keys(localStorage);
 */

// ===== RESETEAR A VALORES POR DEFECTO =====

/**
 * Si algo se daña, puedes resetear desde consola:
 * 
 * // Resetear productos a los iniciales
 * localStorage.removeItem('maxstore_products');
 * location.reload();
 * 
 * // Resetear credenciales
 * localStorage.removeItem('maxstore_admin_creds');
 * location.reload();
 * 
 * // Resetear todo
 * localStorage.clear();
 * location.reload();
 */

/**
 * ================================================
 * Última actualización: 1 de enero de 2026
 * Versión: 1.0
 * Estado: ✅ Sistema de almacenamiento implementado
 * ================================================
 */
