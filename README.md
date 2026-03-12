# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento es tu mapa para conectar la App móvil de iPhone con este panel administrativo usando Firebase.

## 1. Preparación en Xcode (Tu Mac)

### Paso 1: Agregar el archivo de credenciales (¡MUY IMPORTANTE!)
1. Descarga el archivo `GoogleService-Info.plist` desde tu consola de Firebase.
2. Abre tu proyecto en **Xcode**.
3. **Arrastra el archivo** desde tu carpeta de Descargas directamente al panel izquierdo de Xcode.
4. Se abrirá una ventana llamada **"Choose options for adding these files"**.
5. **CONFIGURACIÓN CORRECTA:**
   *   Asegúrate de que el checkbox **"semapach-report"** esté marcado.
   *   Haz clic en el botón azul **Finish**.

### Paso 2: Seleccionar las librerías
1. En Xcode, ve al menú **File > Add Package Dependencies...**
2. Pega esta URL: `https://github.com/firebase/firebase-ios-sdk`
3. En la lista de productos, marca:
   *   **FirebaseCore** (selecciona tu target `semapach-report`)
   *   **FirebaseAuth** (selecciona tu target `semapach-report`)
   *   **FirebaseFirestore** (selecciona tu target `semapach-report`)
4. Dale al botón azul **"Add Package"**.

---

## 2. Código para copiar y pegar en Xcode

Sigue estos dos pasos dentro de Xcode para terminar la App:

### A. Inicialización (Archivo: `semapach_reportApp.swift`)
Busca el archivo con el icono de la "A" azul en Xcode. Borra todo lo que tiene y pega esto:

```swift
import SwiftUI
import FirebaseCore 

@main
struct semapach_reportApp: App {
    // Esto conecta la App con el servidor al iniciar
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

### B. Ver la Recaudación (Archivo: `ContentView.swift`)
Borra todo el contenido de tu `ContentView.swift` y pega este código. Está diseñado para mostrar los datos de SEMAPACH con un diseño profesional:

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

---
**¿Qué hacer ahora?**
1. Copia el código del **Punto A** en tu archivo `App.swift`.
2. Copia el código del **Punto B** en tu archivo `ContentView.swift`.
3. Presiona el botón **Play** (el triángulo arriba a la izquierda) en Xcode.

¡Tu iPhone ya debería estar mostrando los datos de SEMAPACH!
