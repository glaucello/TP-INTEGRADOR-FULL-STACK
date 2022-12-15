const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')

//router para las vistas
router.get('/', authController.isAuthenticated, (req, res)=>{    
    res.render('index', {user:req.user})
})
router.get('/login', (req, res)=>{
    res.render('login', {alert:false})
})
router.get('/register', (req, res)=>{
    res.render('register')
})
router.get('/turnos_create', (req, res)=>{
    res.render('turnos_create')
})


//router para los métodos del controller
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

//router para los turnos
router.get('/turnos', authController.list_turnos)
router.post('/turnos_create', authController.create_turnos)
router.get('/turnos_edit/:idturno', authController.edit_turnos)
router.get('/turnos_delete/:idturno', authController.delete_turnos)

module.exports = router