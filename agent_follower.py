
import pygame
import random
import sys

# --- CONFIGURACIÓN DEL ENTORNO ---
ANCHO, ALTO = 800, 600
CELDAS_X, CELDAS_Y = 20, 15
TAM_CELDA = 40
FPS = 10  # Velocidad de la simulación

# Colores
BLANCO = (240, 240, 240)
NEGRO = (30, 30, 30)
ROJO = (255, 80, 80)   # Color del Agente
AZUL = (80, 80, 255)   # Color de UI
GRIS = (200, 200, 200)

# Orientaciones (basado en el reloj: 0=Norte, 1=Este, 2=Sur, 3=Oeste)
N, E, S, O = 0, 1, 2, 3
FLECHAS = {N: "^", E: ">", S: "v", O: "<"}

class Entorno:
    def __init__(self, ancho, alto):
        self.ancho = ancho
        self.alto = alto
        # 0 = Claro, 1 = Oscuro (Línea)
        self.malla = [[0 for _ in range(ancho)] for _ in range(alto)]
        self.generar_linea_aleatoria()

    def generar_linea_aleatoria(self):
        # Generar un camino aleatorio para simular la línea oscura
        x, y = random.randint(0, self.ancho-1), random.randint(0, self.alto-1)
        pasos = (self.ancho * self.alto) // 3
        for _ in range(pasos):
            self.malla[y][x] = 1
            dx, dy = random.choice([(0,1), (0,-1), (1,0), (-1,0)])
            x = max(0, min(self.ancho-1, x + dx))
            y = max(0, min(self.alto-1, y + dy))

    def obtener_percepcion(self, x, y):
        if 0 <= x < self.ancho and 0 <= y < self.alto:
            return "OSCURO" if self.malla[y][x] == 1 else "CLARO"
        return "BORDE"

class Agente:
    def __init__(self, x, y, entorno):
        self.x = x
        self.y = y
        self.orientacion = N
        self.entorno = entorno
        self.choque = False
        self.desempeño = 0

    def percibir(self):
        # 1. Sensor de contacto (Choque)
        contacto = "CONTACTO" if self.choque else "NO_CONTACTO"
        
        # 2. Cámara 1 (Suelo actual)
        piso = self.entorno.obtener_percepcion(self.x, self.y)
        
        # 3. Cámara 2 (Tres celdas adelante: Izquierda, Centro, Derecha)
        def rel(fwd, side):
            if self.orientacion == N: return self.x + side, self.y - fwd
            if self.orientacion == E: return self.x + fwd, self.y + side
            if self.orientacion == S: return self.x - side, self.y + fwd
            if self.orientacion == O: return self.x - fwd, self.y - side
            return self.x, self.y

        p_izq = self.entorno.obtener_percepcion(*rel(1, -1))
        p_cen = self.entorno.obtener_percepcion(*rel(1, 0))
        p_der = self.entorno.obtener_percepcion(*rel(1, 1))

        return {
            "orientacion": FLECHAS[self.orientacion],
            "contacto": contacto,
            "piso": piso,
            "frente": (p_izq, p_cen, p_der)
        }

    def actuar(self):
        percepciones = self.percibir()
        p_izq, p_cen, p_der = percepciones["frente"]
        
        acciones = []
        
        # LÓGICA DE REFLEXIÓN (Seguidor de línea)
        if p_cen == "OSCURO":
            acciones.append("AVANZAR")
        elif p_izq == "OSCURO":
            acciones.append("ROTAR_+90")
            acciones.append("AVANZAR")
        elif p_der == "OSCURO":
            acciones.append("ROTAR_-90")
            acciones.append("AVANZAR")
        else:
            # Si se perdió, busca rotando o avanzando con cuidado
            if p_cen == "BORDE":
                acciones.append("ROTAR_+90")
            else:
                acciones.append("AVANZAR")

        # Ejecutar máximo 2 acciones por iteración
        for act in acciones[:2]:
            self.ejecutar(act)

    def ejecutar(self, accion):
        self.choque = False
        if accion == "AVANZAR":
            dx, dy = {N: (0,-1), E: (1,0), S: (0,1), O: (-1,0)}[self.orientacion]
            nx, ny = self.x + dx, self.y + dy
            if 0 <= nx < self.entorno.ancho and 0 <= ny < self.entorno.alto:
                self.x, self.y = nx, ny
                if self.entorno.obtener_percepcion(nx, ny) == "OSCURO":
                    self.desempeño += 10
                else:
                    self.desempeño -= 2
            else:
                self.choque = True
                self.desempeño -= 5
        
        elif accion == "ROTAR_+90":
            self.orientacion = (self.orientacion - 1) % 4
        elif accion == "ROTAR_-90":
            self.orientacion = (self.orientacion + 1) % 4

    def dibujar(self, pantalla):
        margen = TAM_CELDA * 0.125
        rect_agente = pygame.Rect(self.x * TAM_CELDA + margen, self.y * TAM_CELDA + margen, 
                                  TAM_CELDA * 0.75, TAM_CELDA * 0.75)
        pygame.draw.rect(pantalla, ROJO, rect_agente, border_radius=5)
        
        centro = rect_agente.center
        font = pygame.font.SysFont("Arial", 20, bold=True)
        txt = font.render(FLECHAS[self.orientacion], True, BLANCO)
        pantalla.blit(txt, txt.get_rect(center=centro))

def principal():
    pygame.init()
    pantalla = pygame.display.set_mode((ANCHO, ALTO))
    pygame.display.set_caption("Agente Seguidor de Líneas - SEMAPACH AI")
    reloj = pygame.time.Clock()
    fuente = pygame.font.SysFont("Consolas", 16)

    entorno = Entorno(CELDAS_X, CELDAS_Y)
    agente = Agente(CELDAS_X//2, CELDAS_Y//2, entorno)

    while True:
        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        agente.actuar()

        # Dibujar
        pantalla.fill(GRIS)
        for y in range(CELDAS_Y):
            for x in range(CELDAS_X):
                rect = pygame.Rect(x * TAM_CELDA, y * TAM_CELDA, TAM_CELDA, TAM_CELDA)
                color = NEGRO if entorno.malla[y][x] == 1 else BLANCO
                pygame.draw.rect(pantalla, color, rect)
                pygame.draw.rect(pantalla, GRIS, rect, 1)

        agente.dibujar(pantalla)

        # UI Info
        p = agente.percibir()
        info = f"Desempeño: {agente.desempeño} | Ori: {p['orientacion']} | Sensores: {p['frente']}"
        surf_txt = fuente.render(info, True, AZUL)
        pantalla.blit(surf_txt, (10, ALTO - 30))

        pygame.display.flip()
        reloj.tick(FPS)

if __name__ == "__main__":
    principal()
