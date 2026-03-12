# Guía de Sincronización Final: Panel SEMAPACH + iPhone

¡Ya casi terminas! Sigue estos pasos para ver los datos en tu iPhone.

## 1. Archivo: `semapach_reportApp.swift`
Este ya lo tienes listo (según tu captura). Es el que "enciende" la conexión.

## 2. Archivo: `ContentView.swift` (La Pantalla)
Haz clic en este archivo en Xcode, borra TODO y pega este código:

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
            // Cabecera
            VStack(spacing: 10) {
                Image(systemName: "drop.fill")
                    .font(.system(size: 70))
                    .foregroundStyle(LinearGradient(colors: [.blue, .cyan], startPoint: .top, endPoint: .bottom))
                    .shadow(radius: 5)
                
                Text("SEMAPACH")
                    .font(.system(size: 32, weight: .black, design: .rounded))
                    .tracking(2)
                
                Text("PANEL DE CONTROL")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 40)
            
            // Tarjeta de Recaudación
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
                Text("ÚLTIMA FECHA REGISTRADA")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.gray)
                Text(lastUpdate)
                    .font(.footnote)
                    .monospaced()
            }
            
            Spacer()
        }
        .onAppear {
            startListening()
        }
    }

    func startListening() {
        // Escucha cambios en tiempo real del panel web
        db.collection("daily_collections")
            .order(by: "date", descending: true)
            .limit(to: 1)
            .addSnapshotListener { snap, error in
                self.isLoading = false
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

## 3. Cómo correr la App
1. En la parte de arriba de Xcode, haz clic donde dice **"iPad Air..."** y cámbialo por un **iPhone** (ej: iPhone 16).
2. Presiona el botón de **Play** (el triángulo arriba a la izquierda).
3. ¡Listo! Verás el simulador abrirse con el diseño azul de SEMAPACH.

*Nota: Si cambias un monto en la web, verás que el iPhone se actualiza solo.*
