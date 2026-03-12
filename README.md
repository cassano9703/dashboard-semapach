# Guía de Sincronización Final: Panel SEMAPACH + iPhone

¡Estás en el último paso! Sigue estas instrucciones para activar los permisos en tu iPhone y ver los datos.

## 1. Activar el "Developer Mode" (Modo Desarrollador)
Si te sale el error "Developer Mode disabled", haz esto en tu **iPhone/Simulador**:
1. Abre **Ajustes** (Settings).
2. Ve a **Privacidad y Seguridad** (Privacy & Security).
3. Baja hasta el fondo y entra en **Modo de Desarrollador** (Developer Mode).
4. Activa el interruptor y dale a **Reiniciar** (Restart).
5. Al prender, presiona **Activar** (Turn On).

## 2. Código Final de los Archivos en Xcode

### A. Archivo: `semapach_reportApp.swift`
*Este código "enciende" la conexión con Google.*
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
*Este código crea la pantalla azul con los montos de dinero.*
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

## 3. Solución de Cierre Inesperado (Error SIGABRT)
Si la App se cierra al abrir:
1. Borra el archivo `GoogleService-Info.plist` de Xcode (Move to Trash).
2. Arrástralo de nuevo desde tu carpeta de Descargas a Xcode.
3. Asegúrate de marcar la casilla **"semapach-report"** en la ventana que sale.
