# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Sigue estos pasos dentro de Xcode para conectar tu iPhone con los datos reales de este panel web.

## 1. Archivo: `semapach_reportApp.swift` (El "Interruptor")

Este archivo es el corazón de tu App. Aquí es donde le decimos al iPhone que use Firebase al arrancar.

**¿Qué hace este código?**
1. `import FirebaseCore`: Trae las herramientas necesarias para hablar con Google.
2. `FirebaseApp.configure()`: Busca tu archivo `GoogleService-Info.plist` y activa la conexión.
3. `ContentView()`: Le dice a la App que la primera pantalla que debe mostrar es la de los resultados.

**CÓDIGO A PEGAR:**
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

Este archivo dibuja lo que ves en el iPhone: el logo de SEMAPACH y el número de recaudación.

**¿Qué hace este código?**
- Escucha la base de datos en **tiempo real**. Si cambias un número en esta web, el iPhone se actualiza solo sin que el usuario haga nada.

**CÓDIGO A PEGAR:**
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

## 3. ¿Cómo probarlo?
1. En **Xcode**, pega el código arriba mencionado en sus respectivos archivos.
2. Presiona el botón **Play** (el triángulo arriba a la izquierda).
3. Abre el simulador de iPhone que aparecerá.
4. Entra a la sección **Administración > Admin Cobranza** en este panel web.
5. Cambia el monto de hoy y ¡mira tu iPhone! El número cambiará al instante.
