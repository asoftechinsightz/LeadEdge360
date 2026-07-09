// Bcrypt password helpers (pure-JS implementation — no native deps)
import bcrypt from 'bcryptjs'
export const hashPassword = (plain) => bcrypt.hash(plain, 10)
export const verifyPassword = (plain, hashed) => bcrypt.compare(plain, hashed)
