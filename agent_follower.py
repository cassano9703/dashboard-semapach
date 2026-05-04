
import pygame
import random
import sys

# --- CONFIGURACIÓN ---
ANCHO, ALTO = 800, 600
CELDAS_X, CELDAS_Y = 20, 15
TAM_CELDA = 40
FPS = 10

# Colores
BLANCO = (240, 240, 240)
NEGRO = (30, 30, 30)
ROJO = (255, 80, 80)
AZUL = (80, 80, 255)
GRIS = (200, 200, 200)

# Orientaciones (basado en el reloj)
N, E, S, O = 0, 1, 2, 3
FLECHAS = {N: "^", E: ">", S: "v", O: "<"}

class Entorno:
    def __init__(self, ancho, alto):
        self.ancho = ancho
        self.alto = alto
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
        self.camino_recorrido = []

    def percibir(self):
        # 1. Propioceptor (Orientación) ya está en self.orientacion
        # 2. Sensor de contacto (Choque)
        contacto = "CONTACTO" if self.choque else "NO_CONTACTO"
        
        # 3. Cámara 1 (Suelo)
        piso = self.entorno.obtener_percepcion(self.x, self.y)
        
        # 4. Cámara 2 (Tres celdas adelante: Izquierda, Centro, Derecha)
        # Calculamos posiciones relativas según la orientación actual
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
            "orientacion": self.orientacion,
            "contacto": contacto,
            "piso": piso,
            "frente": (p_izq, p_cen, p_der)
        }

    def actuar(self):
        percepciones = self.percibir()
        p_izq, p_cen, p_der = percepciones["frente"]
        piso = percepciones["piso"]
        
        acciones = []
        
        # --- TABLA DE REFLEXIÓN SIMPLIFICADA ---
        # Prioridad 1: Seguir línea al frente
        if p_cen == "OSCURO":
            acciones.append("AVANZAR")
        # Prioridad 2: Buscar línea a los lados
        elif p_izq == "OSCURO":
            acciones.append("ROTAR_+90")
            acciones.append("AVANZAR")
        elif p_der == "OSCURO":
            acciones.append("ROTAR_-90")
            acciones.append("AVANZAR")
        # Prioridad 3: Si no hay línea, avanzar para buscar (línea discontinua)
        else:
            # Evitar chocar con bordes
            if p_cen == "BORDE":
                acciones.append("ROTAR_+90")
            else:
                acciones.append("AVANZAR")

        # Ejecutar acciones (máximo 2 por iteración según el requerimiento)
        for act in acciones[:2]:
            self.ejecutar(act)

    def ejecutar(self, accion):
        self.choque = False
        if accion == "AVANZAR":
            dx, dy = {N: (0,-1), E: (1,0), S: (0,1), O: (-1,0)}[self.orientacion]
            nx, ny = self.x + dx, self.y + dy
            if 0 <= nx < self.entorno.ancho and 0 <= ny < self.entorno.alto:
                self.x, self.y = nx, ny
                # Puntaje: +10 por celda oscura, -1 por clara
                if self.entorno.obtener_percepcion(nx, ny) == "OSCURO":
                    self.desempeño += 10
                else:
                    self.desempeño -= 2
            else:
                self.choque = True
                self.desempeño -= 5 # Penalización por choque
        
        elif accion == "ROTAR_+90": # Sentido antihorario (en coordenadas Pygame es izquierda)
            self.orientacion = (self.orientacion - 1) % 4
        elif accion == "ROTAR_-90": # Sentido horario
            self.orientacion = (self.orientacion + 1) % 4

    def dibujar(self, pantalla):
        # El agente ocupa el 75% del área de una celda
        margen = TAM_CELDA * 0.125
        rect_agente = pygame.Rect(self.x * TAM_CELDA + margen, self.y * TAM_CELDA + margen, 
                                  TAM_CELDA * 0.75, TAM_CELDA * 0.75)
        pygame.draw.rect(pantalla, ROJO, rect_agente, border_radius=5)
        
        # Dibujar orientación (flecha o punto)
        centro = rect_agente.center
        font = pygame.font.SysFont("Arial", 20, bold=True)
        txt = font.render(FLECHAS[self.orientacion], True, BLANCO)
        pantalla.blit(txt, txt.get_rect(center=centro))

def principal():
    pygame.init()
    pantalla = pygame.display.set_mode((ANCHO, ALTO))
    pygame.display.set_caption("Agente Seguidor de Líneas - Prototipo")
    reloj = pygame.time.Clock()
    fuente = pygame.font.SysFont("Consolas", 18)

    entorno = Entorno(CELDAS_X, CELDAS_Y)
    agente = Agente(CELDAS_X//2, CELDAS_Y//2, entorno)

    ejecutando = True
    pausado = False

    while ejecutando:
        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                ejecutando = False
            if evento.type == pygame.KEYDOWN:
                if evento.key == pygame.K_SPACE:
                    pausado = not pausado

        if not pausado:
            agente.actuar()

        # Dibujar
        pantalla.fill(GRIS)
        
        # Dibujar Malla
        for y in range(CELDAS_Y):
            for x in range(CELDAS_X):
                rect = pygame.Rect(x * TAM_CELDA, y * TAM_CELDA, TAM_CELDA, TAM_CELDA)
                color = NEGRO if entorno.malla[y][x] == 1 else BLANCO
                pygame.draw.rect(pantalla, color, rect)
                pygame.draw.rect(pantalla, GRIS, rect, 1) # Bordes

        agente.dibujar(pantalla)

        # UI Info
        info_txt = f"Desempeño: {agente.desempeño} | Sensores: {agente.percibir()['frente']} | Espacio: Pausa"
        surf_txt = fuente.render(info_txt, True, AZUL)
        pantalla.blit(surf_txt, (10, ALTO - 30))

        pygame.display.flip()
        reloj.tick(FPS)

    pygame.quit()

if __name__ == "__main__":
    principal()
