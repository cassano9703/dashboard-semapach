# Guía de Sincronización Final: Panel SEMAPACH + iPhone

¡Ya casi terminas! Sigue estos pasos para solucionar los errores de Xcode y ver los datos.

## 1. Solucionar error de "Signing / Team"
Este error impide que la App se ejecute.
1. Haz clic en el icono azul del proyecto (**semapach-report**) arriba a la izquierda.
2. En la ventana principal, haz clic en la pestaña **Signing & Capabilities**.
3. En la sección **Team**, selecciona tu nombre o haz clic en "Add Account" para poner tu Apple ID.
4. Asegúrate de que el **Bundle Identifier** sea algo como `com.tuusuario.semapach-report`.

## 2. Evitar el error de la "Línea Roja" (Crash)
Si la App se cierra apenas abre, es porque no encuentra el archivo de configuración.
1. Busca tu archivo `GoogleService-Info.plist` en Xcode.
2. Haz clic derecho sobre él y selecciona **"Delete"** -> **"Remove Reference"** (No lo borres del disco).
3. Arrástralo de nuevo desde tu carpeta a Xcode.
4. **IMPORTANTE:** En la ventana que sale, asegúrate de marcar la casilla que dice **"semapach-report"** bajo la sección "Add to targets".

## 3. Código Final de los Archivos

### A. Archivo: `semapach_reportApp.swift`
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
    @State private var lastUpdate: String = "Cargando..."
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
1. Selecciona un **iPhone** en la barra superior.
2. Presiona el botón de **Play**.
