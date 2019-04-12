import Joi from 'joi'

export function validate (obj, schema) {
  const {error, value} = Joi.validate(obj, schema)
  if (error) {
    throw error
  }
  return value
}