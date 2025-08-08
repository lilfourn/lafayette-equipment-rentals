// Email validation
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Phone validation (10 digits)
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length === 10
}

// Format phone number to pretty format
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 0) return ''
  if (cleanPhone.length <= 3) return cleanPhone
  if (cleanPhone.length <= 6) return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3)}`
  return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6, 10)}`
}

// Clean phone number (remove all non-digits)
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

// Handle phone input change with formatting
export const handlePhoneInputChange = (
  value: string,
  setValue: (value: string) => void
) => {
  const cleaned = cleanPhoneNumber(value)
  if (cleaned.length <= 10) {
    setValue(formatPhoneNumber(cleaned))
  }
} 