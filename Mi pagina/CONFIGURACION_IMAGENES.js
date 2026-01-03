/**
 * CONFIGURACIÓN DE IMÁGENES - MaxStore Puno
 * 
 * Este archivo documenta la configuración actual de manejo de imágenes
 * en la aplicación MaxStore Puno.
 */

// CARPETAS RELEVANTES:
// /imagenes/ - Carpeta principal para almacenar imágenes de productos

// MÉTODOS DE CARGA SOPORTADOS:
// 1. Archivo local (JPG, PNG, GIF, WebP, HEIC)
// 2. Cámara del dispositivo (móvil)
// 3. URL externa

// FORMATOS AUTOMÁTICAMENTE CONVERTIDOS:
// ✓ JPG → Se mantiene como JPG
// ✓ PNG → Se mantiene como PNG
// ✓ GIF → Se convierte a PNG
// ✓ WebP → Se convierte a PNG
// ✓ HEIC (iPhone) → Se convierte a JPG
// ✓ HEIF → Se convierte a JPG

// REDIMENSIONAMIENTO AUTOMÁTICO:
// - Resolución máxima: 600x600 px
// - Se mantiene la proporción de aspecto original
// - Se comprime a 85% de calidad
// - Tamaño típico resultante: 20-150 KB

// LÍMITES Y RESTRICCIONES:
// - Tamaño máximo entrada: Sin límite (se comprime automáticamente)
// - Tamaño máximo localStorage: ~5-10MB total
// - Formatos soportados: Cualquier formato de imagen
// - Almacenamiento: localStorage + Base64 (codificado)

// FUNCIONES PRINCIPALES:

// 1. processAndConvertImage(file, callback)
//    - Convierte cualquier formato a PNG o JPG
//    - Redimensiona automáticamente
//    - Comprime la imagen
//    - Calcula tamaño final
//    - Devuelve base64 optimizado

// 2. updateImagePreview()
//    - Actualiza la vista previa de la imagen
//    - Llama a processAndConvertImage
//    - Muestra estado de procesamiento
//    - Muestra información de conversión

// 3. Botón "📁 Seleccionar Imagen o Foto"
//    - Abre el selector de archivos
//    - Acepta cualquier archivo de imagen
//    - Procesa automáticamente

// 4. Botón "📷 Tomar Foto (Celular)"
//    - Activa la cámara en dispositivos móviles
//    - Capture automático desde cámara frontal/trasera
//    - Se procesa automáticamente

// 5. Campo URL de Imagen
//    - Permite pegar URL de imagen externa
//    - No se procesa (se usa tal cual)
//    - Útil para referencias de proveedores

// FLUJO DE PROCESAMIENTO:

// archivo.jpg/heic/png
//    ↓
// FileReader → Cargar archivo
//    ↓
// Image → Analizar dimensiones
//    ↓
// Canvas → Redimensionar a 600x600 max
//    ↓
// toDataURL() → Convertir a PNG o JPG
//    ↓
// Comprimir a 85% calidad
//    ↓
// Base64 → Almacenar en localStorage
//    ↓
// Mostrar en vista previa

// TECNOLOGÍAS UTILIZADAS:
// - FileReader API para leer archivos
// - Canvas API para conversión de imágenes
// - Image API para análisis de dimensiones
// - toDataURL() para conversión a base64
// - localStorage para almacenamiento persistente

// ALMACENAMIENTO:
// Las imágenes se guardan de dos formas:

// 1. En localStorage como base64
//    - Automático al guardar producto
//    - Accesible sin conexión
//    - Límite: ~5-10MB por navegador
//    - Se comprime automáticamente

// 2. En la carpeta /imagenes/ (manual)
//    - Referencia para URL
//    - Ejemplo: "imagenes/producto-001.jpg"

// CONVERSIÓN DE FORMATOS:

// JPG → JPG (sin cambios)
// PNG → PNG (sin cambios)
// GIF → PNG (para mantener calidad)
// WebP → PNG (para mejor compatibilidad)
// HEIC → JPG (formato Apple a web)
// HEIF → JPG (format Apple a web)

// VENTAJAS DEL NUEVO SISTEMA:

// ✓ Automático: No necesitas hacer nada
// ✓ Compatible: Todos los formatos funcionan
// ✓ Optimizado: Imágenes comprimidas
// ✓ Rápido: Redimensionamiento instantáneo
// ✓ Informativo: Muestra tamaño y resolución final
// ✓ Confiable: Conversión con canvas (100% navegador)

// SEGURIDAD:
// - Las imágenes se almacenan localmente en el navegador
// - No se envían a servidores externos
// - Se procesan completamente en el cliente
// - Se recomienda encriptación para datos sensibles

// RENDIMIENTO:
// - Canvas es muy eficiente (GPU accelerated)
// - Las imágenes se procesan instantáneamente
// - Base64 ocupa ~33% más espacio que binario
// - Se recomienda comprimir JPEG a 85% calidad

// COMPATIBILIDAD:
// - Compatible con todos los navegadores modernos
// - Canvas: IE 9+, Chrome, Firefox, Safari, Edge
// - FileReader: IE 10+, Chrome, Firefox, Safari, Edge
// - localStorage: Todos los navegadores modernos

// EJEMPLOS DE USO:

// Crear producto con imagen JPG:
// 1. Click en "📁 Seleccionar Imagen o Foto"
// 2. Seleccionar archivo JPG
// 3. Se procesa automáticamente
// 4. Ver preview (redimensionado)
// 5. Click en "Guardar Cambios"

// Crear producto con HEIC (iPhone):
// 1. Click en "📁 Seleccionar Imagen o Foto"
// 2. Seleccionar archivo HEIC
// 3. Se convierte automáticamente a JPG
// 4. Se redimensiona a 600x600 max
// 5. Ver preview
// 6. Click en "Guardar Cambios"

// Crear producto con foto desde celular:
// 1. Click en "📷 Tomar Foto (Celular)"
// 2. Permitir acceso a cámara
// 3. Capturar foto (cualquier formato)
// 4. Se procesa automáticamente
// 5. Ver preview
// 6. Click en "Guardar Cambios"

// Crear producto con URL:
// 1. Copiar URL de imagen
// 2. Pegar en campo "O pega aquí una URL de imagen"
// 3. Ver preview (sin procesar)
// 4. Click en "Guardar Cambios"

// TROUBLESHOOTING:

// Problema: La imagen HEIC no se ve
// Solución: Se convierte automáticamente a JPG
// Verificar: Revisar mensaje de estado

// Problema: La imagen es muy grande
// Solución: Se redimensiona automáticamente a 600x600
// Resultado: Tamaño típico 20-150 KB

// Problema: La imagen se ve borrosa
// Solución: Aumentar calidad en processAndConvertImage (línea ~620)
// Cambiar: quality = 0.85 a quality = 0.95

// Problema: Almacenamiento lleno
// Solución:
// - Eliminar productos antiguos
// - Las imágenes se comprimen automáticamente
// - Usar URLs externas en lugar de base64

// MANTENIMIENTO RECOMENDADO:
// - Revisar imágenes cada mes
// - Eliminar duplicadas
// - Las imágenes se optimizan automáticamente
// - Hacer respaldo de base de datos

// INFORMACIÓN TÉCNICA:

// Resolución estándar: 600x600 px
// Calidad JPEG: 85% (ajustable)
// Calidad PNG: Sin pérdida
// Formato de almacenamiento: Base64 UTF-8
// Índice: localStorage['laptops']

// ESTADÍSTICAS ESPERADAS:

// Imagen promedio: ~50-100 KB
// 100 productos: ~5-10 MB
// Tiempo procesamiento: <1 segundo
// Tiempo guardado: <100ms

/**
 * Última actualización: 1 de enero de 2026
 * Versión: 2.0 (Convertidor automático)
 * Autor: MaxStore Admin
 * Cambios: Conversión y redimensionamiento automático
 */
