const joi = require("joi");

const leaveValidation = joi.object({
  type: joi.string()
    .valid("Annual", "Sick", "Casual", "Unpaid")
    .required()
});

module.exports = { leaveValidation };