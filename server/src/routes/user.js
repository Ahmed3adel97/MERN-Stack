const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();

const User = require('../models/user.model')
const Expense = require('../models/expense.model')


const register = async (req, res, next) => {
  const { name, email, password, joined } = req.body;
  const newUser = new User({
    name,
    email,
    password,
    joined
  })
  try{
     const user = await newUser.save()
     return res.send({user})
  }catch(e){
      next(e)
  }
}
const login = async (req, res, next)=> {
  //username and password in the request
  const {email, password} = req.body
  try{
    //check the username and passowrd are ok
     const user = await User.findOne({email})
     if(!user){
       const err = new Error(`this email ${email}is not found`)
       err.status = 404
       next(err)
     }
       //if credential are ok create jwt and return it

     user.isPasswordMatch(password, user.password, (err, match)=>{
       if(match){
         // create jwt token
         const secret = 'ThisIsTopSexret'
         const expiration = '7d'
         const token = jwt.sign({_id: user.id}, secret, {expiresIn: expiration})
         return res.send({token})
       }
       res.status(401).send({
         message: 'invaild user'
       })
     })


      
  }
  catch(e){
    next(e)
  }
}

const createExpense = async (req, res, next)=>{
  const {amount, description, created} = req.body
  console.log(1)
  const newExpense = new Expense({
      amount,
      description, 
      created,
      owner: req.user
  })
  try{
      const saved = await newExpense.save()
      return res.send({
          success: true,
          expense: saved
      })

  }catch(e){
      next(e)
  }
}

const getExpense = async (req, res, next)=>{
  const {user} = req
  const query = {
    owner: user._id
  }
  try{
  const result = await Expense.find(query)
  return res.send({
    result
  })
}catch(e){
  next(e)
}

}


const deleteExpense = async (req, res, next) => {
  const expense_id = req.params.expense_id;
  console.log(1)
  const check = await Expense.findOne({ _id: expense_id });
  if (!check.owner.equals(req.user._id)) {
    const err = new Error('This exepense object does not belong to you!');
    err.status = 401;
    throw err;
  }

  try {
    await Expense.deleteOne({ _id: expense_id });
    res.send({
      success: true
    });
  } catch (e) {
    next(e);
  }
};

const updateExpense = async (req, res, next) => {
  const expense_id = req.params.expense_id;
  const { amount, description, created } = req.body;

  try {
    const check = await Expense.findOne({ _id: expense_id });
    if (!check.owner.equals(req.user._id)) {
      const err = new Error('This exepense object does not belong to you!');
      err.status = 401;
      throw err;
    }

    const expense = await Expense.update(
      { _id: expense_id },
      { amount, description, created }
    );
    return res.send({
      success: true,
      expense
    });
  } catch (e) {
    next(e);
  }
};


router.post('/register',register)
router.post('/auth',login)

router.all('*', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user) {
          const error = new Error('You are not authorized to access this area');
          error.status = 401;
          throw error;
      }

      //
      req.user = user;
      return next();
  })(req, res, next);
});
///--------------- Authenticated Routes

// Add Expense 

router.post('/expenes', createExpense)
router.get('/expenes', getExpense)
router.delete('/expense/:expense_id',deleteExpense);
router.put('/expense/:expense_id',updateExpense);




module.exports = router;