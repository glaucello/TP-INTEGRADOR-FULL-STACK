const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const {promisify} = require('util')
const { PassThrough } = require('stream')
const { clearScreenDown } = require('readline')

//procedimiento para registrarnos
exports.register = async (req, res)=>{    
    try {
        const name = req.body.name
        const user = req.body.user
        const pass = req.body.pass
        let passHash = await bcryptjs.hash(pass, 8)    
        //console.log(passHash)   
        conexion.query('INSERT INTO usuarios SET ?', {user:user, name: name, pass:passHash}, (error, results)=>{
            if(error){console.log(error)}
            res.redirect('/')
        })
    } catch (error) {
        console.log(error)
    }       
}

exports.login = async (req, res)=>{
    try {
        const user = req.body.user
        const pass = req.body.pass        

        if(!user || !pass ){
            res.render('login',{
                alert:true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un usuario y password",
                alertIcon:'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            })
        }else{
            conexion.query('SELECT * FROM usuarios WHERE user = ?', [user], async (error, results)=>{
                if( results.length == 0 || ! (await bcryptjs.compare(pass, results[0].pass)) ){
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o Password incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    })
                }else{
                    //inicio de sesión OK
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    //generamos el token SIN fecha de expiracion
                   //const token = jwt.sign({id: id}, process.env.JWT_SECRETO)
                   //console.log("TOKEN: "+token+" para el USUARIO : "+user)

                   const cookiesOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                   }
                   res.cookie('jwt', token, cookiesOptions)
                   res.render('login', {
                        alert: true,
                        alertTitle: "Conexión exitosa",
                        alertMessage: "¡LOGIN CORRECTO!",
                        alertIcon:'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                   })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.isAuthenticated = async (req, res, next)=>{
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM usuarios WHERE id = ?', [decodificada.id], (error, results)=>{
                if(!results){return next()}
                req.user = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }else{
        res.redirect('/login')        
    }
}

exports.logout = (req, res)=>{
    res.clearCookie('jwt')   
    return res.redirect('/')
}

exports.list_turnos = async(req, res)=>{
    const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
    conexion.query('SELECT T.idturno, E.especialidad_nombre as especialidad, CONCAT(M.apellido_medico, " ", M.nombre_medico) as medico, date_format(fecha, "%d-%m-%Y") as fecha, CONCAT(H.hora_inicial,  " ", H.hora_salida) as horario FROM usuarios AS U INNER JOIN turnos AS T ON T.id = U.id INNER JOIN especialidades as E ON E.idespecialidad = T.idespecialidad INNER JOIN medicos AS M ON M.idmedico = T.idmedico INNER JOIN horarios as H ON H.idhorario = T.idhorario WHERE U.id = ?', [decodificada.id], (error, results)=>{
        if(error){
            //throw error;
            console.log(error);
        }else{
            res.render('turnos_index', {turnos:results});
            //console.log(results);
        }
    })
}


exports.create_turnos = (req, res)=>{
    try {
        const newTurno = req.body;
        conexion.query("INSERT INTO turnos set ?", [newTurno], async (error, results, next)=>{
            return res.redirect('/turnos');
        })
    } catch (error) {
        console.log(error);
    }}

    exports.edit_turnos = (req, res)=>{
        const idturno = req.params.idturno;
        console.log(idturno);
        conexion.query("SELECT * FROM turnos WHERE idturno = ?",[idturno], async (error, results)=>{
            if(error){
                //throw error;
                console.log(error);
            }else{
                //res.render('turnos_index', {turnos:results});
                console.log(results);
            }
        })}

        exports.delete_turnos = (req, res)=>{
            const idturno = req.params.idturno;
            console.log(idturno);
            conexion.query("DELETE FROM turnos WHERE idturno = ?",[idturno], async (error, results)=>{
                if(error){
                    throw error;
                    //console.log(error);
                }else{
                    return res.redirect('/turnos');
                    //console.log(results);
                }
            })}

            