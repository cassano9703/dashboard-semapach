# 🚀 Guía Definitiva: De Prototipo a las Tiendas (SEMAPACH)

Esta guía te llevará paso a paso para que la App de monitoreo comercial de SEMAPACH pase de ser un prototipo a una herramienta oficial descargable.

---

## ⚠️ IMPORTANTE: No mezclar lenguajes
*   **Xcode:** Solo acepta código **Swift** (para la App de iPhone).
*   **Terminal/VS Code:** Se usan para código **Python** (como el Agente seguidor de líneas).
*   **Error Común:** Si pegas el código de Python en Xcode, verás muchos errores rojos porque Xcode no entiende Python.

---

## 1. Comparativa de Costos: Apple vs. Android

Si la institución decide publicar la App formalmente, estos son los costos oficiales:

| Característica | Apple App Store (iPhone) | Google Play Store (Android) |
| :--- | :--- | :--- |
| **Costo de Registro** | $99 USD | $25 USD |
| **Frecuencia de Pago** | **Anual** (Cada año) | **Pago único** (Para siempre) |

---

## 2. Cómo ejecutar el Agente de Python (agent_follower.py)

Este es un proyecto independiente de la App de iPhone. Para verlo funcionar en tu Mac:

1.  **Instalar Pygame:** Abre la "Terminal" de tu Mac y escribe:
    `pip3 install pygame`
2.  **Crear el archivo:** Crea un archivo llamado `agente.py` en tu carpeta de documentos.
3.  **Ejecutar:** En la terminal, navega a la carpeta y escribe:
    `python3 agente.py`

---

## 3. Código de la Interfaz "Aquarium" (SwiftUI para Xcode)

Copia este código y pégalo en el archivo `ContentView.swift` de tu proyecto en Xcode:

```swift
import SwiftUI
import FirebaseFirestore

struct ContentView: View {
    @State private var dailyAmount: Double = 0.0
    @State private var monthlyAccumulated: Double = 0.0
    @State private var monthlyGoal: Double = 1.0 
    @State private var isLoading = true
    @State private var waveOffset = Angle(degrees: 0)
    
    private var db = Firestore.firestore()
    
    var progress: Double {
        min(monthlyAccumulated / monthlyGoal, 1.0)
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.blue.opacity(0.1), Color.white], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 25) {
                    // Header
                    HStack {
                        VStack(alignment: .leading) {
                            Text("SEMAPACH")
                                .font(.system(size: 28, weight: .black, design: .rounded))
                                .foregroundColor(.blue)
                            Text("Dashboard Comercial")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Image(systemName: "drop.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(LinearGradient(colors: [.blue, .cyan], startPoint: .top, endPoint: .bottom))
                    }
                    .padding(.horizontal)
                    
                    // AQUARIUM VIEW (El tanque de agua)
                    VStack(spacing: 15) {
                        ZStack {
                            Circle()
                                .stroke(Color.blue.opacity(0.1), lineWidth: 15)
                                .frame(width: 240, height: 240)
                            
                            // Aquí va la lógica de las olas
                            LiquidWaveView(progress: progress, waveOffset: waveOffset)
                                .clipShape(Circle())
                                .frame(width: 220, height: 220)
                            
                            VStack {
                                Text("\(Int(progress * 100))%")
                                    .font(.system(size: 55, weight: .black, design: .rounded))
                                    .foregroundColor(progress > 0.4 ? .white : .blue)
                                Text("DE LA META")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(progress > 0.4 ? .white.opacity(0.8) : .secondary)
                            }
                        }
                        .onAppear {
                            withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                                waveOffset = Angle(degrees: 360)
                            }
                        }
                    }
                    
                    // Info Cards...
                }
            }
        }
    }
}
```

---

## 4. Publicación en Tiendas
1. **Cuenta Developer:** Registrarse en Apple Developer.
2. **Xcode:** Configurar el "Team" en Signing & Capabilities.
3. **Archive:** Crear el paquete final y enviarlo a revisión.
