const {UserModel} = require ("../models/User")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function User(req, res){
    const{ email, password } = req.body
    if(!email){
        return res.status(422).json({msg: "O email é obrigatório"})
    }
    if(!password){
        return res.status(422).json({msg: "A senha é obrigatória"})
    }
    const user = await UserModel.findOne({ email:email })
    if(!user){
        return res.status(404).json({msg: "Usuário não existe"})
    }
    const checkPassword = await bcrypt.compare(password, user.password)
    if(!checkPassword){
        return res.status(422).json({msg: "Senha inválida"})  
    }
    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id:user._id
        }, secret)
        res.status(200).json({msg: "Autenticação realizada com sucesso!", token})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}
async function getUser(req, res){
    const id = req.params.id
    const user = await UserModel.findById(id, '-password')
    if(!user){
        return res.status(404).json({msg: 'Usuário não encontrado'})
    }
    res.status(200).json({user})
}
function checkToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        return res.status(401).json({msg: "Acesso negado"})
    }
    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
    } catch (error) {
        return res.status(400).json({msg: "Token inválido"})
    }
}
module.exports = {User, getUser, checkToken}
