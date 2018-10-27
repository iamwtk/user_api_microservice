import passwordValidator from 'password-validator'

const Password = new passwordValidator()

Password
.is().min(6)
.is().max(32)
.has().uppercase()
.has().lowercase()
.has().digits()
.has().not().spaces()
.is().not().oneOf(['Passw0rd', 'Password123'])

export default Password