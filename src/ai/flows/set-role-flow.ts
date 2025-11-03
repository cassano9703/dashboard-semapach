'use server';
/**
 * @fileOverview Flow de Genkit para asignar roles de administrador a usuarios.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Esquema de entrada para el flow
const SetAdminRoleInputSchema = z.object({
  email: z.string().email('Por favor, introduce un correo válido.'),
});

// Esquema de salida para el flow
const SetAdminRoleOutputSchema = z.object({
  message: z.string(),
});

// Inicializar Firebase Admin SDK (solo si no se ha inicializado)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Asigna el custom claim 'role: admin' a un usuario de Firebase por su correo.
 * @param {object} input - El objeto de entrada.
 * @param {string} input.email - El correo del usuario.
 * @returns {Promise<{message: string}>} Un mensaje de confirmación.
 */
export const setAdminRole = ai.defineFlow(
  {
    name: 'setAdminRoleFlow',
    inputSchema: SetAdminRoleInputSchema,
    outputSchema: SetAdminRoleOutputSchema,
    auth: (auth, input) => {
        // Esta es una política de autorización de Genkit.
        // Permite que el superadmin temporal se asigne el rol.
        if (auth?.email === 'cassano9703@gmail.com') {
          return;
        }
        // Solo permite que usuarios con el claim 'role: admin' ejecuten este flow.
        if (auth?.custom?.role !== 'admin') {
            throw new Error('No tienes permisos para realizar esta acción.');
        }
    }
  },
  async ({ email }) => {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      const uid = userRecord.uid;

      // Obtener los claims actuales del usuario
      const currentClaims = userRecord.customClaims || {};

      // Añadir el nuevo claim de rol
      const newClaims = {
        ...currentClaims,
        role: 'admin',
      };

      // Establecer los nuevos claims
      await admin.auth().setCustomUserClaims(uid, newClaims);
      
      return {
        message: `El rol 'admin' ha sido asignado correctamente a ${email}.`,
      };
    } catch (error: any) {
      console.error('Error al asignar el rol:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No se encontró ningún usuario con ese correo electrónico.');
      }
      throw new Error(
        'Ocurrió un error inesperado al intentar asignar el rol.'
      );
    }
  }
);