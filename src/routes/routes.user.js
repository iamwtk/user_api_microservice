import express from 'express'
import * as UserController  from '../controllers/controller.user'

const router = express.Router()

router.get('/', UserController.get)

module.exports = router

