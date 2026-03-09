# Panel Estadístico SEMAPACH

Este es el panel administrativo y de visualización de datos para SEMAPACH, construido con Next.js y Firebase.

## Sincronización con Aplicaciones Móviles

Este proyecto está centralizado en **Firebase**, lo que permite una sincronización en tiempo real con aplicaciones iOS, Android y multiplataforma.

### 1. ¿Qué herramientas usar?

Dependiendo de cómo decidas construir tu App móvil, el proceso cambia:

#### A. Si usas Xcode (App Nativa para iPhone)
*   **Editor:** Xcode (Gratis en la App Store de Mac).
*   **Descarga:** Descarga siempre la versión **estable** (no la beta) para evitar errores inesperados durante el desarrollo.
*   **Conexión:** 
    1. Descarga el archivo `GoogleService-Info.plist` de la consola de Firebase.
    2. Arrástralo dentro de tu proyecto en Xcode.
    3. **Muy importante:** Al arrastrarlo, asegúrate de marcar la casilla **"Add to targets"** para tu App, de lo contrario no encontrará las credenciales.
    4. Ve a `File > Add Package Dependencies` y pega: `https://github.com/firebase/firebase-ios-sdk`.
    5. Selecciona `FirebaseAuth` y `FirebaseFirestore`.

#### B. Si usas VS Code (Flutter o React Native)
*   **Editor:** Visual Studio Code.
*   **Ventaja:** Escribes un solo código que funciona en Android y iPhone.
*   **Conexión:**
    1. Instalas el plugin de Firebase para tu lenguaje (`firebase_core` en Flutter o `@react-native-firebase/app` en React Native).
    2. **Importante:** Aunque uses VS Code, si quieres que la App funcione en iPhone, necesitarás tener Xcode instalado en tu Mac para realizar la compilación final.

### 2. Pasos Generales en Firebase
1. **Firebase Console:** Ve a la consola de Firebase del proyecto `semapach-report`.
2. **Agregar Aplicación:** Haz clic en "Añadir aplicación" y selecciona la plataforma (Android o iOS).
3. **Mismos Datos:** La App debe leer las mismas colecciones:
   - `daily_collections` (Recaudación)
   - `monthly_goals` (Metas)
   - `recovered_services` (Suspendidos)
   - `meter_data` (Medición)

Cualquier dato que guardes en este panel web aparecerá automáticamente en la App móvil en menos de un segundo.

---
git remote set-url origin https://cassano9703@github.com/FrankRemuzgo/semapach.git
