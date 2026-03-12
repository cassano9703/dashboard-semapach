# Guía de Sincronización Final: Panel SEMAPACH + iPhone

¡Ya casi terminas! Sigue estos pasos para solucionar los errores de Xcode y ver los datos reales.

## 1. Solucionar error de "Signing / Team"
Este error impide que la App se instale.
1. En la ventana **Signing & Capabilities**, haz clic en el selector de **Team**.
2. Elige tu nombre. Si no aparece, haz clic en **"Add Account..."** y pon tu correo de Apple (iCloud).
3. **Contraseña del Llavero:** Si te sale una ventana pidiendo una contraseña para "codesign", ingresa la **contraseña de inicio de sesión de tu Mac** y haz clic en **"Permitir siempre"**.

## 2. Evitar el cierre de la App (Error SIGABRT)
Si la App se cierra apenas abre (línea roja en Xcode), es porque el archivo de Google no está bien vinculado.
1. Busca el archivo `GoogleService-Info.plist` en el panel izquierdo de Xcode.
2. **Bórralo** (clic derecho -> Delete -> Move to Trash).
3. **Arrástralo de nuevo** desde tu carpeta de descargas directamente al panel izquierdo de Xcode.
4. **MUY IMPORTANTE:** En la ventana que sale al soltarlo, asegúrate de que esté marcada la casilla que dice **"semapach-report"** bajo la sección "Add to targets".

## 3. Código Final de los Archivos

### A. Archivo: `semapach_reportApp.swift`
```swift
import SwiftUI
import FirebaseCore

@main
struct semapach_reportApp: App {
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
1. Selecciona tu **iPhone** (o un simulador) en la barra superior.
2. Presiona el botón de **Play** (el triángulo arriba a la izquierda).
