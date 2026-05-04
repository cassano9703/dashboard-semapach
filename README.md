# 🚀 Guía Definitiva: SEMAPACH (App + Agente AI)

Este proyecto contiene dos partes independientes. Es **CRÍTICO** no mezclar los lenguajes.

---

## 🛠️ PARTE 1: La App de iPhone (Xcode / Swift)
Esta es la interfaz "Aquarium" con las olas dinámicas.

**Instrucciones:**
1. Abre **Xcode**.
2. Abre el archivo `ContentView.swift`.
3. **BORRA TODO** lo que haya y pega el código Swift (el que empieza con `import SwiftUI`).
4. Si pegas código de Python aquí, verás errores rojos.

---

## 🐍 PARTE 2: El Agente Seguidor de Líneas (Python / Pygame)
Este es un simulador de IA que corre en tu computadora.

**Cómo ejecutarlo:**
1. Abre la **Terminal** de tu Mac.
2. Instala la librería Pygame:
   `pip3 install pygame`
3. Ve a la carpeta de este proyecto:
   `cd [ruta_de_tu_carpeta]`
4. Ejecuta el agente:
   `python3 agent_follower.py`

---

## 💰 Comparativa de Lanzamiento (Tiendas)

| Característica | Apple App Store (iPhone) | Google Play Store (Android) |
| :--- | :--- | :--- |
| **Costo** | $99 USD Anuales | $25 USD (Pago único) |
| **Dificultad** | Alta (Revisión estricta) | Media |
| **Uso en SEMAPACH** | Ideal para directivos | Ideal para técnicos en campo |

---

## 🌊 Código de la Interfaz "Aquarium" (Para Xcode)
Copia esto si borraste accidentalmente el código de la App:

```swift
import SwiftUI

struct ContentView: View {
    @State private var progress: Double = 0.65 // 65% de la meta
    @State private var waveOffset = Angle(degrees: 0)
    
    var body: some View {
        VStack(spacing: 30) {
            Text("SEMAPACH")
                .font(.largeTitle).bold()
                .foregroundColor(.blue)
            
            // EL ACUARIO
            ZStack {
                Circle()
                    .stroke(Color.blue.opacity(0.2), lineWidth: 10)
                    .frame(width: 250, height: 250)
                
                // Olas animadas
                WaveShape(offset: waveOffset, percent: progress)
                    .fill(LinearGradient(colors: [.blue, .cyan], startPoint: .top, endPoint: .bottom))
                    .clipShape(Circle())
                    .frame(width: 230, height: 230)
                
                VStack {
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 50, weight: .black, design: .rounded))
                        .foregroundColor(progress > 0.5 ? .white : .blue)
                    Text("RECAUDADO")
                        .font(.caption).bold()
                        .foregroundColor(progress > 0.5 ? .white.opacity(0.8) : .secondary)
                }
            }
            .onAppear {
                withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                    waveOffset = Angle(degrees: 360)
                }
            }
            
            // Datos
            HStack(spacing: 20) {
                StatCard(title: "Meta", value: "S/ 2.8M", color: .gray)
                StatCard(title: "Hoy", value: "S/ 45k", color: .green)
            }
        }
        .padding()
    }
}

struct WaveShape: Shape {
    var offset: Angle
    var percent: Double
    
    var animatableData: Double {
        get { offset.degrees }
        set { offset = Angle(degrees: newValue) }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let lowAmplitudeHeight = 10.0
        let waveWidth = rect.width
        let waveHeight = rect.height
        let yOffset = (1 - percent) * waveHeight
        
        path.move(to: CGPoint(x: 0, y: yOffset))
        
        for x in stride(from: 0, through: waveWidth, by: 1) {
            let relativeX = x / waveWidth
            let sine = sin(relativeX * .pi * 2 + offset.radians)
            let y = yOffset + sine * lowAmplitudeHeight
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: waveWidth, y: waveHeight))
        path.addLine(to: CGPoint(x: 0, y: waveHeight))
        path.closeSubpath()
        
        return path
    }
}

struct StatCard: View {
    var title: String
    var value: String
    var color: Color
    var body: some View {
        VStack {
            Text(title).font(.caption).foregroundColor(.secondary)
            Text(value).font(.headline).foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.blue.opacity(0.05))
        .cornerRadius(15)
    }
}
```
