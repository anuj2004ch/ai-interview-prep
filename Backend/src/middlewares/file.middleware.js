const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1,
        fields: 2,
        parts: 4,
        fieldSize: 12 * 1024,
        fieldNestingDepth: 0
    },
    fileFilter(req, file, callback) {
        const isPdfMime = file.mimetype === "application/pdf"
        const hasPdfExtension = file.originalname.toLowerCase().endsWith(".pdf")

        if (!isPdfMime || !hasPdfExtension) {
            const error = new Error("Only PDF resume files are allowed.")
            error.status = 400
            return callback(error)
        }

        callback(null, true)
    }
})


module.exports = upload
