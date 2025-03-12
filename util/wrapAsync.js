function wrapAsync(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next); // Correct async error handling
    };
}

// ✅ Correct export syntax
module.exports = { wrapAsync };
