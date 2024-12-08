const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const {
    User,
} = require('../models');


router.use(async (req,res,next)=> {
    try{
        const dbUrl = process.env.DB_URL;
        await mongoose.connect(dbUrl);
        console.log('db connected');
        next();
    }catch(e){
        console.error('db connect error');
        console.error(e);
    }
});

router.post('/users', async (req,res)=>{
    const user = new User({
        username: req.body.username,
    });
    const result = await user.save();
    console.log(result.toJSON());
    res.json(result);
});

module.exports = router;