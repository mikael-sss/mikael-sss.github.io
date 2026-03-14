import { z } from 'zod'

export const SignUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  organization_name: z.string().min(2, 'Nome da organização deve ter no mínimo 2 caracteres'),
})

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const ProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  sku: z.string().optional(),
  unit_price: z.number().positive('Preço deve ser positivo'),
  cost_price: z.number().positive().optional(),
  stock_quantity: z.number().nonnegative().default(0),
  is_active: z.boolean().default(true),
})

export type SignUpInput = z.infer<typeof SignUpSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ProductInput = z.infer<typeof ProductSchema>
