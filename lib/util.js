"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validate = validate;

var _joi = _interopRequireDefault(require("joi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(obj, schema) {
  var _Joi$validate = _joi.default.validate(obj, schema),
      error = _Joi$validate.error,
      value = _Joi$validate.value;

  if (error) {
    throw error;
  }

  return value;
}