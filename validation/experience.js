const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateExperienceInput(data) {
    /*eslint-disable*/
  let errors = {}

  data.company = !isEmpty(data.company) ? data.company : ''
  data.title = !isEmpty(data.title) ? data.title : ''
  data.from = !isEmpty(data.from) ? data.from : ''

  if (Validator.isEmpty(data.title)) {
    errors.title = 'Job title field is required'
  }

  if (Validator.isEmpty(data.company)) {
    errors.company = 'Company Field is required'
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = 'From Date field is required'
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
