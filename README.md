# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento es tu mapa para conectar la App móvil de iPhone con este panel administrativo usando Firebase.

## 1. Preparación en Xcode (Tu Mac)

### Paso 1: Seleccionar las librerías (La pantalla de tu imagen)
1. En la ventana que tienes abierta en Xcode (**Choose Package Products**):
2. Busca en la lista y marca los checks de:
   *   **FirebaseAuth**
   *   **FirebaseFirestore**
3. **CRÍTICO:** En la columna **"Add to Target"**, haz clic donde dice `None` y selecciona tu App (ej: `semapach_report`).
4. Dale al botón azul **"Add Package"**.

### Paso 2: El archivo de credenciales
1. Asegúrate de que el archivo `GoogleService-Info.plist` esté dentro de tu carpeta de proyecto en Xcode.
2. **Revisar el Target Membership:** 
   * Haz clic en el archivo `.plist` en la lista de la izquierda de Xcode.
   * Abre el panel derecho (File Inspector).
   * Asegúrate de que tu App esté marcada con un check azul.

---

## 2. Código para copiar y pegar en Xcode

### A. Inicialización (Archivo: `semapach_reportApp.swift`)
Busca el archivo con el icono de la "A" azul y asegúrate de que tenga esto:

```swift
import SwiftUI
import FirebaseCore 

@main
struct semapach_reportApp: App {
    init() {
        FirebaseApp.configure() // Esto enciende la conexión
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### B. Ver la Recaudación (Archivo: `ContentView.swift`)
Borra todo el contenido de tu `ContentView.swift` y pega este código. Está configurado para leer los datos exactos de esta web:

```swift
import SwiftUI
import FirebaseFirestore 

struct ContentView: View {
    @State private var dailyAmount: Double = 0.0
    private var db = Firestore.firestore()

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "drop.fill")
                .font(.system(size: 80))
                .foregroundStyle(.blue)
            
            Text("Panel SEMAPACH")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack {
                Text("Última Recaudación Diaria")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                
                // Este número se actualiza solo cuando editas la web
                Text("S/ \(dailyAmount, specifier: "%.2f")")
                    .font(.system(size: 50, weight: .black, design: .rounded))
                    .foregroundColor(.primary)
            }
            .padding(30)
            .background(Color.blue.opacity(0.1))
            .cornerRadius(20)
            
            Text("Sincronizado en tiempo real")
                .font(.caption)
                .foregroundColor(.green)
        }
        .padding()
        .onAppear {
            startListening()
        }
    }

    func startListening() {
        // Busca en la colección 'daily_collections' que usa la web
        db.collection("daily_collections")
            .order(by: "date", descending: true)
            .limit(to: 1)
            .addSnapshotListener { snap, error in
                if let docs = snap?.documents, let lastDoc = docs.first {
                    // Extrae el campo 'dailyCollectionAmount'
                    self.dailyAmount = lastDoc.data()["dailyCollectionAmount"] as? Double ?? 0.0
                }
            }
    }
}
```

---
**Nota:** El ID de tu proyecto es `studio-5698097440-ab57f`. Cualquier dato que guardes en la sección "Administración" de esta web aparecerá en segundos en tu iPhone.
