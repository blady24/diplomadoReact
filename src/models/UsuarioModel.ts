import z from 'zod';

export const schemaUsuarios = z.object({
  username: z.string().min(3, 'El nombre de Usuario es obligatorio'),
  password: z.string().min(6, 'La contraseña es obligatoria'),
});

export type UsuariosFormValues = z.infer<typeof schemaUsuarios>;