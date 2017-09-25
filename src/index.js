require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const path = require('path')
const jwt = require('jsonwebtoken')
const bodyparser = require('body-parser')
const express_jwt = require('express-jwt')
const csrf = require('csurf')

app.set('views engine', 'pug')

const query = require('./query')
app.use(express.static(path.join(__dirname, '..', 'public')))
app.use(bodyparser.json())

app.get('/', (req, res) => {
  res.render('index.pug')
})

const jwtMiddleWare = express_jwt({secret: 'mysecret'})

app.post('/user',  (req,res) => {
  const {username, password} = req.body
  query.createUser(username, password)
    .then(([id]) => {
      const token = jwt.sign({id}, 'mysecret')
      res.send({token})
    })
})

app.post('/login', (req,res) => {
  const {username, password} = req.body
  query.compareUser(username, password)
    .then(user  => {
      const token = jwt.sign({id: user.id} , 'mysecret')
      res.send({token})
    })
})

//데이터베이스 : 스네이크 케이스를 사용하는게 관례
app.get('/todos', jwtMiddleWare,  (req, res) => {
  const user_id = req.user.id // req.user // 토큰에 있는 정보를 저장하는 곳(jwtmiddleware가 한다)
  //userId가 소유하고 있는 할 일 목록을 불러와서 반환
  query.getTodosByUserId(user_id)
    .then(todos => {
      res.send(todos)
    })
})

app.post('/todos', jwtMiddleWare, (req,res) => {
  const user_id = req.user.id
  const title = req.body.title
  //const {title} = req.body
  query.createTodo(user_id, title)
    .then(([id])=>{
      //res.end() //생성이 됬으니까 성공했다는 정보만 주면된다. 200응답을 잘 보낸다.
      return query.getTodoById(id)
    })
    .then(todo => {
      res.status(201)
      res.send(todo)
    })
})

app.get('/user', jwtMiddleWare, (req,res) =>{
  query.getUserbyId(req.user.id)
    .then(user => {
      res.send({
        username: user.username
      })
    })
})

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({
      error: err.name,
      message: err.message
    })
  }
})

app.listen(process.env.PORT, () => {
  console.log('listen')
})
