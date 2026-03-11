# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento es tu mapa para conectar la App móvil de iPhone con este panel administrativo usando Firebase.

## 1. En la Consola de Firebase (Navegador)

Para obtener tus credenciales:
1.  Ve a **Configuración (icono de engranaje)** > **Configuración del proyecto**.
2.  En la pestaña "General", baja hasta **"Tus apps"**.
3.  Selecciona tu App de iOS y descarga el archivo **`GoogleService-Info.plist`**.

## 2. En Xcode (Tu Mac)

### Paso 1: Agregar el archivo de configuración
1.  Arrastra el archivo `GoogleService-Info.plist` dentro de tu proyecto en Xcode.
2.  **IMPORTANTE:** En la ventana que aparece, marca **"Copy items if needed"**.
3.  Haz clic en el archivo dentro de Xcode y, en el panel derecho (**File Inspector**), verifica que en **"Target Membership"** tu App tenga el check azul marcado.

### Paso 2: Instalar librerías de Firebase
1.  Ve a **File > Add Package Dependencies...**
2.  Pega esta URL: `https://github.com/firebase/firebase-ios-sdk`
3.  Selecciona y agrega estos dos paquetes:
    *   **FirebaseAuth**: Para el inicio de sesión.
    *   **FirebaseFirestore**: Para los datos en tiempo real.

---

## 3. Código de Conexión (Swift)

### Inicialización (TuProyectoApp.swift)
Copia esto en tu archivo principal para "encender" la conexión:

```swift
import SwiftUI
import FirebaseCore

@main
struct SemapachMobileApp: App {
    init() {
        FirebaseApp.configure() // Activa la conexión
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### Leer Datos (Ejemplo de Recaudación)
Usa este código en tu vista para que los números cambien solos cuando los edites en la web:

```swift
import FirebaseFirestore

class DashboardViewModel: ObservableObject {
    @Published var dailyAmount: Double = 0.0
    private var db = Firestore.firestore()

    func listenToCollection() {
        // Escucha el documento del día de hoy
        let today = "2025-03-05" 
        
        db.collection("daily_collections").document(today).addSnapshotListener { snapshot, error in
            if let data = snapshot?.data() {
                self.dailyAmount = data["dailyCollectionAmount"] as? Double ?? 0.0
            }
        }
    }
}
```

## 4. Nombres de las Colecciones
Para que la App "vea" lo mismo que la web, usa estos nombres exactos en tu código:
*   `daily_collections`: Recaudación diaria.
*   `district_progress`: Avance por distritos.
*   `recovered_services`: Usuarios recuperados.
*   `meter_data`: Datos de micromedición.

---
**Tip de Seguridad:** Los usuarios que crees en el panel de administración de la web podrán entrar a la App móvil con sus mismas credenciales automáticamente.
