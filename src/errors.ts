import { ZodError } from 'zod'

export class StacValidationError extends Error {
  readonly objectType: string
  readonly zodError: ZodError

  constructor(objectType: string, zodError: ZodError) {
    const message = zodError.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
        return `${path}: ${issue.message}`
      })
      .join('; ')
    super(`${objectType} validation failed: ${message}`)
    this.name = 'StacValidationError'
    this.objectType = objectType
    this.zodError = zodError
  }

  get issues() {
    return this.zodError.issues
  }
}
