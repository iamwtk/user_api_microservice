
export const isAdmin = (req, res, next) => {
    if (req.payload.role === 'admin') return next()
    return res.status(401).json({message: 'You are not an admin.'})
}