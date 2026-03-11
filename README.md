# Panel Estadístico SEMAPACH

Este es el panel administrativo y de visualización de datos para SEMAPACH, construido con Next.js y Firebase.

## Sincronización con Aplicaciones Móviles

Este proyecto está centralizado en **Firebase**, lo que permite una sincronización en tiempo real con aplicaciones iOS, Android y multiplataforma.

### 1. ¿Qué herramientas usar?

Dependiendo de cómo decidas construir tu App móvil, el proceso cambia:

#### A. Si usas Xcode (App Nativa para iPhone)
*   **Instalación:** Al instalar Xcode, asegúrate de marcar la casilla **iOS 26.2**. Las demás (watchOS, tvOS) son opcionales.
*   **Editor:** Xcode (Gratis en la App Store de Mac).
*   **Conexión de Configuración:** 
    1. Descarga el archivo `GoogleService-Info.plist` de la consola de Firebase del proyecto `semapach-report`.
    2. Arrástralo dentro de tu proyecto en Xcode (en el navegador de archivos de la izquierda).
    3. **Muy importante:** Al arrastrarlo, asegúrate de marcar la casilla **"Add to targets"** para tu App y seleccionar **"Copy items if needed"**.
*   **Agregar el "Cerebro" (Packages):**
    1. Ve a `File > Add Package Dependencies...`.
    2. En el buscador (arriba a la derecha), pega: `https://github.com/firebase/firebase-ios-sdk`.
    3. Selecciona la versión por defecto y dale a **Add Package**.
    4. En la lista de librerías, marca **obligatoriamente**:
        - `FirebaseAuth`
        - `FirebaseFirestore`
    5. Dale a **Add Package** de nuevo.

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
