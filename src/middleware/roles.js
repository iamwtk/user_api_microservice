
export const isSuperUser = (req, res, next) => {

    if (req.payload.role === 'superuser') 
        return next()

    return res
            .status(401)
            .json({message: 'You are not an superuser.'})
}