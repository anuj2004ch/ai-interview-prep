const mongoose = require("mongoose")

function validate(schema, property = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[property])

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid request data.",
                errors: result.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            })
        }

        req[property] = result.data
        next()
    }
}

function validateObjectId(paramName) {
    return (req, res, next) => {
        if (!mongoose.isObjectIdOrHexString(req.params[paramName])) {
            return res.status(400).json({ message: `Invalid ${paramName}.` })
        }
        next()
    }
}

module.exports = { validate, validateObjectId }
