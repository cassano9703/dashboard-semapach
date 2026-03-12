# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Sigue estos pasos dentro de Xcode para conectar tu iPhone con los datos reales de este panel web.

## 1. Archivo: `semapach_reportApp.swift` (El "Interruptor")

Este archivo inicializa Firebase. Borra todo y pega esto:

```swift
import SwiftUI
import FirebaseCore 

@main
struct semapach_reportApp: App {
    // La función init corre apenas abres la App en el iPhone
    init() {
        // Esto busca tu archivo .plist y conecta la App a internet
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            // Aquí le decimos que empiece mostrando el panel de resultados
            ContentView()
        }
    }
}
```

---

## 2. Archivo: `ContentView.swift` (La Interfaz Visual)

Este archivo dibuja la pantalla. Borra todo y pega esto:

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
            // Cabecera: Logo y Título
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
            
            // Tarjeta de Datos
            VStack(spacing: 20) {
                Text("Recaudación Diaria")
                    .font(.headline)
                    .foregroundStyle(.secondary)
                
                if isLoading {
                    ProgressView() // Ruedita de carga
                        .scaleEffect(1.5)
                } else {
                    Text("S/ \(dailyAmount, specifier: "%.2f")")
                        .font(.system(size: 50, weight: .black, design: .rounded))
                        .foregroundColor(.primary)
                }
                
                HStack {
                    Circle()
                        .fill(isLoading ? .orange : .green)
                        .frame(width: 8, height: 8)
                    Text(isLoading ? "Sincronizando..." : "Conectado en tiempo real")
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
            
            // Pie de página
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

    // Función que lee los datos de la web automáticamente
    func startListening() {
        // Buscamos el registro más reciente en la colección 'daily_collections'
        db.collection("daily_collections")
            .order(by: "date", descending: true)
            .limit(to: 1)
            .addSnapshotListener { snap, error in
                self.isLoading = false
                if let docs = snap?.documents, let lastDoc = docs.first {
                    // Actualizamos el monto
                    self.dailyAmount = lastDoc.data()["dailyCollectionAmount"] as? Double ?? 0.0
                    // Actualizamos la fecha
                    if let dateStr = lastDoc.data()["date"] as? String {
                        self.lastUpdate = dateStr
                    }
                }
            }
    }
}
```

---

## 3. Cómo correr la App (Simulador)

1. **Espera la descarga:** En tu imagen se ve que Xcode está descargando el simulador (8.39 GB). Debes esperar a que termine.
2. **Selecciona el modelo:** Haz clic arriba en el centro (donde dice "semapach-report > ...") y elige un iPhone (ej: iPhone 16).
3. **Botón Play:** Presiona el triángulo arriba a la izquierda.
4. **Prueba:** Cambia un dato en la web y verás el cambio en el iPhone.

## Solución de Problemas
- **Error de conexión:** Asegúrate de que el archivo `GoogleService-Info.plist` esté dentro de Xcode y tenga el check marcado en el panel derecho (File Inspector).
