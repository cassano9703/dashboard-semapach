# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento es tu mapa para conectar la App móvil de iPhone con este panel administrativo usando Firebase.

## 1. Preparación en Xcode (Tu Mac)

### Paso 1: Agregar el archivo de credenciales (¡MUY IMPORTANTE!)
1. Descarga el archivo `GoogleService-Info.plist` desde tu consola de Firebase.
2. Abre tu proyecto en **Xcode**.
3. **Arrastra el archivo** desde tu carpeta de Descargas directamente al panel izquierdo de Xcode (donde están tus archivos `.swift`).
4. Se abrirá una ventana llamada **"Choose options for adding these files"**.
5. **CONFIGURACIÓN CORRECTA:**
   *   Asegúrate de que el checkbox **"semapach-report"** en la sección **Targets** esté marcado con el check azul.
   *   Haz clic en el botón azul **Finish**.
6. Haz clic en **Finish**.

### Paso 2: Seleccionar las librerías
1. En Xcode, ve al menú **File > Add Package Dependencies...**
2. Pega esta URL: `https://github.com/firebase/firebase-ios-sdk`
3. En la lista de productos, marca:
   *   **FirebaseCore** (selecciona tu target `semapach-report`)
   *   **FirebaseAuth** (selecciona tu target `semapach-report`)
   *   **FirebaseFirestore** (selecciona tu target `semapach-report`)
4. Dale al botón azul **"Add Package"**.

---

## 2. Solución de Errores Comunes (Xcode)

Si ves un error que dice **"invalid archive"** o **"Adding Package Failed"**:
1. Ve al menú superior de Xcode: **File > Packages > Reset Package Caches**.
2. Espera a que la barra de progreso arriba termine de descargar todo de nuevo.
3. Si el error persiste, usa **Product > Clean Build Folder**.

---

## 3. Código para copiar y pegar en Xcode

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
                
                Text("S/ \(dailyAmount, specifier: "%.2f")")
                    .font(.system(size: 54, weight: .black, size: .rounded))
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
        db.collection("daily_collections")
            .order(by: "date", descending: true)
            .limit(to: 1)
            .addSnapshotListener { snap, error in
                if let docs = snap?.documents, let lastDoc = docs.first {
                    self.dailyAmount = lastDoc.data()["dailyCollectionAmount"] as? Double ?? 0.0
                    if let dateStr = lastDoc.data()["date"] as? String {
                        self.lastUpdate = dateStr
                    }
                }
            }
    }
}
```

---
**Nota Final:** Tu App ahora está vinculada al proyecto `studio-5698097440-ab57f`. Si cambias un dato en el panel web, lo verás en tu iPhone al instante.
