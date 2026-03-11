# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento detalla cómo conectar tu aplicación móvil de iOS (desarrollada en Xcode) con los datos en tiempo real de este panel administrativo.

## 1. Configuración Inicial en Xcode

Sigue estos pasos con cuidado para que tu App reconozca el servidor de Firebase:

### Paso 1: Agregar el archivo de credenciales
1. Localiza el archivo `GoogleService-Info.plist` que descargaste de la consola de Firebase.
2. Abre tu proyecto en **Xcode**.
3. Arrastra el archivo desde tu carpeta hacia el panel izquierdo de Xcode (donde están tus archivos de código).
4. **IMPORTANTE:** Aparecerá una ventana de opciones. Asegúrate de que:
   - [x] **Copy items if needed** esté marcado.
   - [x] **Add to targets** tenga marcada la casilla con el nombre de tu App.
5. Una vez agregado, haz clic en el archivo en Xcode y verifica en el panel derecho (File Inspector) que en la sección **"Target Membership"**, tu App tenga el check azul.

### Paso 2: Agregar las Librerías de Firebase
1. En Xcode, ve al menú superior: **File > Add Package Dependencies...**
2. En el cuadro de búsqueda (arriba a la derecha), pega esta URL:
   `https://github.com/firebase/firebase-ios-sdk`
3. Xcode encontrará el paquete. Haz clic en **Add Package**.
4. En la lista de productos que aparece, busca y selecciona (marca el check) de estos dos:
   - **FirebaseAuth**: Para el manejo de usuarios.
   - **FirebaseFirestore**: Para los datos de recaudación.
5. Haz clic en **Add Package** para terminar la instalación.

---

## 2. Inicializar Firebase en tu App

En tu archivo principal (normalmente se llama `TuProyectoApp.swift`), pega este código:

```swift
import SwiftUI
import FirebaseCore // 1. Importa el motor de Firebase

@main
struct SemapachMobileApp: App {
    
    // 2. Inicializador que arranca la conexión
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

---

## 3. Leer Datos en Tiempo Real (Ejemplo)

Para mostrar la **"Recaudación del Día"** en tu App y que cambie automáticamente cuando la edites en la web, usa este código en tu vista:

```swift
import FirebaseFirestore // Importa la base de datos

class DashboardViewModel: ObservableObject {
    @Published var dailyAmount: Double = 0.0
    private var db = Firestore.firestore()

    func fetchCurrentCollection() {
        // Ejemplo: Leer el documento del día de hoy
        let today = "2025-03-05" 
        
        db.collection("daily_collections").document(today).addSnapshotListener { document, error in
            if let document = document, document.exists {
                let data = document.data()
                self.dailyAmount = data?["dailyCollectionAmount"] as? Double ?? 0.0
            }
        }
    }
}
```

## 4. Estructura de Datos Compartida

Tu App móvil debe usar estos nombres exactos de colecciones para ver lo mismo que la web:
*   `daily_collections`: Recaudación por fecha.
*   `district_progress`: Avance de metas por distrito.
*   `recovered_services`: Usuarios recuperados.
*   `meter_data`: Datos de micromedición.

---
**Nota de Seguridad:** Los mismos correos y contraseñas que uses para entrar al panel web funcionarán en la App móvil automáticamente.
