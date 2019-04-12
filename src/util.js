// @flow

import Joi from 'joi'

export function validate<T> (obj: any, schema: any): T {
  const {error, value} = Joi.validate(obj, schema)
  if (error) {
    throw error
  }
  return value
}