# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento es tu mapa para conectar la App móvil de iPhone con este panel administrativo usando Firebase.

## 1. Preparación en Xcode (Tu Mac)

### Paso 1: Seleccionar las librerías (La pantalla de tu imagen)
1. En la ventana que tienes abierta en Xcode (**Choose Package Products**):
2. Busca en la lista y marca los checks de:
   *   **FirebaseCore** (¡Obligatorio!)
   *   **FirebaseAuth**
   *   **FirebaseFirestore**
3. **CRÍTICO:** En la columna **"Add to Target"**, asegúrate de que esos tres digan `semapach-report` (haz clic donde dice `None` para cambiarlo). Los demás pueden quedarse en `None`.
4. Dale al botón azul **"Add Package"**.

### Paso 2: El archivo de credenciales
1. Asegúrate de que el archivo `GoogleService-Info.plist` esté dentro de tu carpeta de proyecto en Xcode.
2. **Revisar el Target Membership:** 
   * Haz clic en el archivo `.plist` en la lista de la izquierda de Xcode.
   * Abre el panel derecho (File Inspector).
   * Asegúrate de que tu App (`semapach-report`) esté marcada con un check azul.

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
        FirebaseApp.configure() // Esto enciende la conexión con el panel web
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
    @State private var lastUpdate: String = "Cargando..."
    private var db = Firestore.firestore()

    var body: some View {
        VStack(spacing: 25) {
            // Icono de SEMAPACH
            Image(systemName: "drop.fill")
                .font(.system(size: 80))
                .foregroundStyle(LinearGradient(colors: [.blue, .cyan], startPoint: .top, endPoint: .bottom))
                .shadow(radius: 10)
            
            Text("Panel SEMAPACH")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            
            // Tarjeta de Recaudación
            VStack(spacing: 15) {
                Text("Última Recaudación Diaria")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                
                // Este número se actualiza solo cuando guardas en la web
                Text("S/ \(dailyAmount, specifier: "%.2f")")
                    .font(.system(size: 54, weight: .black, design: .rounded))
                    .foregroundColor(.primary)
                
                Text("Actualizado: \(lastUpdate)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding(40)
            .background(Color.blue.opacity(0.05))
            .cornerRadius(25)
            .overlay(
                RoundedRectangle(cornerRadius: 25)
                    .stroke(Color.blue.opacity(0.2), lineWidth: 1)
            )
            
            HStack {
                Circle().fill(.green).frame(width: 8, height: 8)
                Text("Sincronizado en tiempo real")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.green)
            }
        }
        .padding()
        .onAppear {
            startListening()
        }
    }

    func startListening() {
        // Escucha la colección 'daily_collections' que usa este panel
        db.collection("daily_collections")
            .order(by: "date", descending: true)
            .limit(to: 1)
            .addSnapshotListener { snap, error in
                if let docs = snap?.documents, let lastDoc = docs.first {
                    // Extrae el monto diario
                    self.dailyAmount = lastDoc.data()["dailyCollectionAmount"] as? Double ?? 0.0
                    
                    // Extrae la fecha del registro
                    if let dateStr = lastDoc.data()["date"] as? String {
                        self.lastUpdate = dateStr
                    }
                }
            }
    }
}
```

---
**Nota Final:** El ID de tu proyecto es `studio-5698097440-ab57f`. Cualquier dato que guardes en la sección **"Administración"** de esta web aparecerá automáticamente en tu iPhone en menos de 2 segundos.
