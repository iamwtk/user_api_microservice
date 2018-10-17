import express from 'express'
import auth from '../middleware/auth'
import * as UserController  from '../controllers/controller.user'
import { isAdmin } from '../middleware/roles'

const router = express.Router()

router.get('/', auth.required ,UserController.get)
router.get('/all', auth.required, isAdmin, UserController.getAll)
router.post('/signup', auth.optional, UserController.signup)
router.post('/login', UserController.login)
// router.post('/edit', UserController.get)
// router.post('/delete', UserController.get)

module.exports = router

