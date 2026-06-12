export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  businessName: string
  businessType: 'Patiserie' | 'Cofetărie' | 'Brutărie' | 'Altele'
  county: string
  phone?: string
  description?: string
  productionScale?: string
  dietaryOptions?: string[]
  specialties?: string
  createdAt: string
  // Am adăugat rolul aici:
  role?: { id: string, action?: string, name: 'ADMIN' | 'NORMAL_USER' } 
}

export type RegisterData = Omit<User, 'id' | 'createdAt' | 'role'> & { password: string }
export type LoginData    = { email: string; password: string }