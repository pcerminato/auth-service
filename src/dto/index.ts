import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/* TODO nestjs/swagger */

const AuthSchema = z.object({
  email: z.string().trim().min(1, { message: 'Email is required.' }).email(),
  password: z.string().trim().min(6, {
    message: 'The length of the password must be at least 6 characters long.',
  }),
  name: z.string().trim().min(1, { message: 'Name is required.' }),
});

const LoginSchema = z.object({
  email: z.string().trim().min(1, { message: 'Email is required.' }),
  password: z.string().trim().min(1, { message: 'Password is required.' }),
});

/* export type AuthDto = z.infer<typeof AuthSchema>;
export type LoginDto = z.infer<typeof LoginSchema>; */
export class AuthDto extends createZodDto(AuthSchema) {}
export class LoginDto extends createZodDto(LoginSchema) {}
