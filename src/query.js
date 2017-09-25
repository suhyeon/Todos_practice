const knex = require('./knex')
const bcrypt = require('bcrypt')
const validator = require('validator')
//jwt : 토큰안에 정보가 들어간다.
/**
 *
 * @param {*} username - 사용자 이름
 * @param {*} password - 해시 적용 전 암호
 * @return {Promise}
 */
function createUser(username, password) {
   return bcrypt.hash(password, 10)
   .then((hashed_password) => {
    return knex('user')
      .insert({
        username,
        hashed_password
      })
    })
}
/**
 *
 * @param {*} username - 사용자 이름
 * @param {*} password - 해시 적용 전 암호
 * @return {Promise}
 */
function compareUser(username, password) {
  return knex('user')
    .where({username})
    .first()
    .then(user => {
      if (user) {
        return bcrypt.compare(password, user.hashed_password)
        .then(compare => {
          return user
        })
      } else {
        throw new Error('해당하는 아이디가 존재하지 않습니다.')
      }
    })
}
/**
 *
 * @param {*} id - user id
 */
function getUserbyId(id){
  return knex('user')
    .where({id})
    .first()
}
/**
 *
 * @param {*} user_id - user id
 */
function getTodosByUserId(user_id){
  return knex('todo')
    .where({user_id})
}
/**
 *
 * @param {*} user_id - user id
 * @param {*} title - title
 */
function createTodo(user_id, title){
  return knex('todo')
    .insert({
      user_id,
      title
    })
}
function getTodoById(id){
  return knex('todo')
    .where({id})
    .first()
}
module.exports = {
  compareUser,
  createUser,
  getUserbyId,
  getTodosByUserId,
  createTodo,
  getTodoById
}
