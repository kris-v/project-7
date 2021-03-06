const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { Pool } = require('pg')
const res = require('express/lib/response')
const { user } = require('pg/lib/defaults')
const pool = new Pool()



// exports.addNewUser = (req, res, next) => {
//     const {username, password, email, bio} = req.body
//     const user = new User({username, password, email, bio})
//     user.createUser()
//     .then(() => {
//         res.status(201).json({
//             message: 'User created successfully!'
//         })
//       } 
//     ).catch(
//         (error) => {
//             const errorToThrow = new Error();
//             switch (error?.code) {
//                 case '23505':
//                     errorToThrow.message = 'User already exists';
//                     errorToThrow.statusCode = 403;
//                     break;
//                 default:
//                     errorToThrow.statusCode = 500;
//             }
//             //pass error to next()
//             next(errorToThrow);
//         }
//     )
// }


exports.signup = (req, res) => {
  bcrypt.hash(req.body.password, 10).then(
    (hash) => {
      // const {username, email, password, bio} = req.body

      const user = {
        username: req.body.username,
        email: req.body.email,
        password: hash,
      }
  
      pool.query(`INSERT INTO users(username, email, password) 
      VALUES ($1, $2, $3)`,
      [user.username, user.email, user.password], (error) => {
        if (error) {
          throw error
        }
        res.status(201).send('New user added.')
      })
    }
    )
  }
  
  
  
  exports.login = (req, res) => {
    const email = req.body.email.toLowerCase()
    console.log(req.body)
    console.log(email)
    let queryResult = []
    
    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
      if (error) {
        throw error
      }
      queryResult = results.rows
      
      bcrypt.compare(req.body.password, queryResult[0].password).then(
        (valid) => {
          if (!valid) {
            console.log('Password is incorrect')
            return res.status(401).json({
              error: new Error('Incorrect password')
            });
          }
          console.log(queryResult[0])
          console.log('Login successfull')


          const token = jwt.sign(
          { userId: queryResult[0].user_id },
          'RANDOM_TOKEN_STRING',
          { expiresIn: '24h'})
          res.status(200).json({
            email: req.body.email,
            token: token
          });
        }
        )
      })
    }
    



    exports.getOneUser = (req, res, next) => {
      const id = parseInt(req.params.id)
      
        pool.query('SELECT * FROM users WHERE user_id = $1', [id], (error, results) => {
          if (error) {
            throw error
          }
          res.status(200).json(results.rows)
        })
    }




    
    exports.deleteUser = (request, response) => {
      const id = parseInt(request.params.id)
  
    pool.query('DELETE FROM users WHERE user_id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send('User successfully deleted.')
    })
}


exports.getAllUsers = (request, response) => {
  
    pool.query('SELECT * FROM users', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}


