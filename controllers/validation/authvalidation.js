const joi = require("joi");

const registerSchema = joi.object({
    name: joi.string().trim().min(3).max(50).custom((value, helpers) => {
        const words = value.trim().split(/\s+/);
        if (words.length < 2) {
            return helpers.message("Full name must include at least first and last name");
        }
        return value;
    }).required(),

    email: joi.string().trim().email().required().messages({
        "string.email": "Invalid email format"
    }),

    password: joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.pattern.base":
                "Password must include uppercase, lowercase, number, and special character"
        }),

    role: joi.string().valid("employee", "hr").default("employee"),
});

module.exports = {
    registerSchema
};