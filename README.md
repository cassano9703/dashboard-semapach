# Guía de Sincronización Final: Panel SEMAPACH + iPhone

¡Ya casi terminas! Sigue estos pasos para solucionar los errores de Xcode y ver los datos.

## 1. Solucionar error de "Signing / Team"
Este error impide que la App se ejecute.
1. En la ventana que tienes abierta, mira la columna de la izquierda bajo el título **TARGETS**.
2. Haz clic en **semapach-report** (el que tiene el icono de la App).
3. En las pestañas que aparecen arriba (General, Signing & Capabilities, Resource Tags...), haz clic en **Signing & Capabilities**.
4. En la sección **Team**, selecciona tu nombre o haz clic en "Add Account" para poner tu Apple ID.

## 2. Evitar el error de la "Línea Roja" (Crash)
Si la App se cierra apenas abre o sale una línea roja en el código, es porque no encuentra el archivo de configuración.
1. Busca tu archivo `GoogleService-Info.plist` en el panel izquierdo de Xcode.
2. Haz clic derecho sobre él y selecciona **"Delete"** -> **"Remove Reference"** (No lo borres del disco).
3. Arrástralo de nuevo desde tu carpeta de descargas a la carpeta de Xcode.
4. **IMPORTANTE:** En la ventana que sale al soltarlo, asegúrate de marcar la casilla que dice **"semapach-report"** bajo la sección "Add to targets".

## 3. Código Final de los Archivos

### A. Archivo: `semapach_reportApp.swift` (Icono A azul)
```swift
import SwiftUI
import FirebaseCore

@main
struct semapach_reportApp: App {
    // Inicializa Firebase al arrancar
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

### B. Archivo: `ContentView.swift`
```swift
import SwiftUI
import FirebaseFirestore 

struct ContentView: View {
    @State private var dailyAmount: Double = 0.0
    @State private var isLoading = true
    private var db = Firestore.firestore()

    var body: some View {
        VStack(spacing: 30) {
            VStack(spacing: 10) {
                Image(systemName: "drop.fill")
                    .font(.system(size: 70))
                    .foregroundStyle(LinearGradient(colors: [.blue, .cyan], startPoint: .top, endPoint: .bottom))
                
                Text("SEMAPACH")
                    .font(.system(size: 32, weight: .black, design: .rounded))
                
                Text("PANEL DE CONTROL")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 40)
            
            VStack(spacing: 20) {
                Text("Recaudación Diaria")
                    .font(.headline)
                
                if isLoading {
                    ProgressView()
                } else {
                    Text("S/ \(dailyAmount, specifier: "%.2f")")
                        .font(.system(size: 50, weight: .black, design: .rounded))
                        .foregroundColor(.blue)
                }
                
                Text(isLoading ? "Sincronizando..." : "Conectado en tiempo real")
                    .font(.caption2)
                    .foregroundColor(.green)
            }
            .frame(maxWidth: .infinity)
            .padding(40)
            .background(Color.blue.opacity(0.05))
            .cornerRadius(30)
            
            Spacer()
        }
        .onAppear {
            startListening()
        }
    }

    func startListening() {
        // Escucha cambios en tiempo real del último registro ingresado
        db.collection("daily_collections")
            .order(by: "date", descending: true)
            .limit(to: 1)
            .addSnapshotListener { snap, error in
                self.isLoading = false
                if let docs = snap?.documents, let lastDoc = docs.first {
                    self.dailyAmount = lastDoc.data()["dailyCollectionAmount"] as? Double ?? 0.0
                }
            }
    }
}
```

## 4. Cómo correr la App
1. Selecciona un **iPhone** en la barra superior (donde dice iPad Air ahora mismo).
2. Presiona el botón de **Play** (el triángulo arriba a la izquierda).
