const Joi = require('joi');

const userRegisterValidationSchema = Joi.object({
    username: Joi.string().trim().min(3).required().messages({
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username must be at least 3 characters',
        'any.required': 'Username is required',
    }),

    email: Joi.string().trim().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email cannot be empty',
        'any.required': 'Email is required',
    }),

    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be 10 digits',
        'string.empty': 'Phone cannot be empty',
        'any.required': 'Phone is required',
    }),

    password: Joi.string().trim().min(8).max(128).required().messages({
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required',
    })
}).options({ stripUnknown: true });

const userLoginValidationSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email cannot be empty',
        'any.required': 'Email is required',
    }),

    password: Joi.string().trim().min(8).max(128).required().messages({
        'string.empty': 'Password cannot be empty',
        'any.required': 'Password is required',
    })
});

module.exports = {
    userRegisterValidationSchema,
    userLoginValidationSchema
};