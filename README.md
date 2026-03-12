# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Sigue estos pasos dentro de Xcode para conectar tu iPhone con los datos de este panel.

## 1. Configuración de Archivos en Xcode

### A. Inicialización (Archivo: `semapach_reportApp.swift`)
Haz clic en este archivo en tu Xcode, borra lo que tiene y pega esto:

```swift
import SwiftUI
import FirebaseCore 

@main
struct semapach_reportApp: App {
    // Esto conecta la App con el servidor de Firebase al iniciar
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

### B. Interfaz Principal (Archivo: `ContentView.swift`)
Haz clic en este archivo en tu Xcode, borra todo y pega este código:

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
            // Cabecera con Logo
            VStack(spacing: 10) {
                Image(systemName: "drop.fill")
                    .font(.system(size: 70))
                    .foregroundStyle(LinearGradient(colors: [.blue, .cyan], startPoint: .top, endPoint: .bottom))
                    .shadow(radius: 5)
                
                Text("SEMAPACH")
                    .font(.system(size: 32, weight: .black, design: .rounded))
                    .tracking(2)
                
                Text("PANEL DE CONTROL COMERCIAL")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 40)
            
            // Tarjeta de Recaudación Principal
            VStack(spacing: 20) {
                Text("Recaudación Diaria")
                    .font(.headline)
                    .foregroundStyle(.secondary)
                
                if isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                } else {
                    Text("S/ \(dailyAmount, specifier: "%.2f")")
                        .font(.system(size: 50, weight: .black, design: .rounded))
                        .foregroundColor(.primary)
                        .transition(.opacity)
                }
                
                HStack {
                    Circle()
                        .fill(isLoading ? .orange : .green)
                        .frame(width: 8, height: 8)
                    Text(isLoading ? "Sincronizando..." : "Sincronizado en tiempo real")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(isLoading ? .orange : .green)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(40)
            .background(Color.blue.opacity(0.05))
            .cornerRadius(30)
            .overlay(
                RoundedRectangle(cornerRadius: 30)
                    .stroke(Color.blue.opacity(0.1), lineWidth: 2)
            )
            .padding(.horizontal)
            
            // Info adicional
            VStack(spacing: 5) {
                Text("ÚLTIMA ACTUALIZACIÓN")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.gray)
                Text(lastUpdate)
                    .font(.footnote)
                    .monospaced()
            }
            
            Spacer()
            
            Text("© 2025 SEMAPACH")
                .font(.caption2)
                .foregroundColor(.secondary)
                .padding(.bottom, 20)
        }
        .onAppear {
            startListening()
        }
    }

    // Esta función lee los datos de la web automáticamente
    func startListening() {
        // Buscamos en la colección 'daily_collections' el registro más reciente
        db.collection("daily_collections")
            .order(by: "date", descending: true)
            .limit(to: 1)
            .addSnapshotListener { snap, error in
                self.isLoading = false
                if let docs = snap?.documents, let lastDoc = docs.first {
                    // Obtenemos el monto
                    self.dailyAmount = lastDoc.data()["dailyCollectionAmount"] as? Double ?? 0.0
                    // Obtenemos la fecha
                    if let dateStr = lastDoc.data()["date"] as? String {
                        self.lastUpdate = dateStr
                    }
                }
            }
    }
}
```

---
## 2. ¡Listo para probar!
Una vez pegado el código:
1. Presiona el botón **Play** (triángulo arriba a la izquierda) en Xcode.
2. Abre tu panel web SEMAPACH.
3. Cambia un dato de recaudación en la web.
4. **¡Mira tu iPhone!** El número cambiará automáticamente.
