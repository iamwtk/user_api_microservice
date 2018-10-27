/**
 *  Application routing
 * @module routes/routes 
 */

import express              from 'express'
import auth                 from '../middleware/auth'
import * as UserController  from '../controllers/controller.user'
import * as AuthController  from '../controllers/controller.auth'
import { isSuperUser }      from '../middleware/roles'

const router = express.Router()

//AUTH
router.post('/signup', auth.optional, AuthController.signup)

router.post('/login', AuthController.login)

//USER
router.get('/', auth.required, UserController.getSingle)

router.get('/all', auth.required, isSuperUser, UserController.getAll)

router.post('/delete', auth.required, isSuperUser, UserController.deleteUser)

router.post('/update', auth.required, UserController.updateUser)

module.exports = router

