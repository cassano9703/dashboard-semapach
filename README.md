# Panel Estadístico SEMAPACH

Este es el panel administrativo y de visualización de datos para SEMAPACH, construido con Next.js y Firebase.

## Sincronización con Aplicaciones Móviles (iOS - Xcode)

Para que tu App móvil vea los mismos datos que esta web, sigue estos pasos técnicos dentro de tu proyecto de Xcode:

### 1. Configuración Inicial
1. **Archivo de Credenciales:** Asegúrate de que el archivo `GoogleService-Info.plist` esté dentro de tu proyecto en Xcode y que la casilla **"Target Membership"** de tu App esté marcada para ese archivo.
2. **Librerías:** Debes haber agregado el paquete `https://github.com/firebase/firebase-ios-sdk` y seleccionado `FirebaseAuth` y `FirebaseFirestore`.

### 2. Inicializar Firebase en tu App
En tu archivo principal (ejemplo: `TuApp.swift`), importa Firebase e inicialízalo:

```swift
import SwiftUI
import FirebaseCore

@main
struct SemapachMobileApp: App {
    // Inicializador de Firebase
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### 3. Leer Datos de Recaudación (Ejemplo)
Para mostrar la "Recaudación del Día" en tu App, usa este código en tu vista:

```swift
import FirebaseFirestore

class DashboardViewModel: ObservableObject {
    @Published var dailyAmount: Double = 0.0
    private var db = Firestore.firestore()

    func fetchCurrentCollection() {
        let today = "2025-03-05" // Formato YYYY-MM-DD (debe ser dinámico)
        
        db.collection("daily_collections").document(today).addSnapshotListener { document, error in
            if let document = document, document.exists {
                let data = document.data()
                self.dailyAmount = data?["dailyCollectionAmount"] as? Double ?? 0.0
            }
        }
    }
}
```

### 4. Colecciones Disponibles
Tu App móvil debe apuntar a estas mismas carpetas (colecciones) para ver los datos del panel:
*   `daily_collections`: Datos de recaudación diaria.
*   `monthly_goals`: Metas de recaudación y deuda.
*   `recovered_services`: Usuarios suspendidos recuperados.
*   `meter_data`: Indicadores de micromedición.
*   `district_progress`: Avance por cada distrito.

### 5. Seguridad
Los usuarios que crees en la sección de **Administración** de esta web podrán entrar a la App móvil usando sus mismos correos y contraseñas mediante la función `Auth.auth().signIn(withEmail: email, password: password)`.

---
Cualquier dato guardado en la web aparecerá en la App en menos de 1 segundo de forma automática.
