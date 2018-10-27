/**
 *  Application routing
 * @module routes/routes 
 */

import express              from 'express'
import auth                 from '../middleware/auth'
import * as UserController  from '../controllers/controller.user'
import * as AuthController  from '../controllers/controller.auth'
import { isAdmin }          from '../middleware/roles'

const router = express.Router()

//AUTH
router.post('/signup', auth.optional, AuthController.signup)

router.post('/login', AuthController.login)

//USER
router.get('/', auth.required, UserController.getSingle)

router.get('/all', auth.required, isAdmin, UserController.getAll)

router.post('/delete', auth.required, isAdmin, UserController.deleteUser)

router.post('/update', auth.required, UserController.updateUser)

module.exports = router

