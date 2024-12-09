const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const {
    User,
    Exercise,
} = require('../models');


router.use(async (req,res,next)=> {
    try{
        const dbUrl = process.env.DB_URL;
        await mongoose.connect(dbUrl);
        next();
    }catch(e){
        console.error('db connect error');
        console.error(e);
    }
});

router.route('/users')
.post(async (req,res)=>{
    const user = new User({
        username: req.body.username,
    });
    const result = await user.save();
    res.json(result);
})
.get(async (req,res)=>{
    res.json(await User.find({}).select('_id username').exec());
});

router.post('/users/:_id/exercises', async (req,res)=>{
    const {
        description,
        duration,
        date,
    } = req.body;
    const userId = req.params._id;
    const user = await User.findById(userId);
    if(!user){
        return res.status(400).send('invalid user');
    }

    const exercise = new Exercise({
        userId: new mongoose.Types.ObjectId(user._id),
        description,
        duration: Number(duration),
        date: date ? new Date(date) : new Date(),
    });
    const result = await exercise.save();


    res.json({
        username: user.username,
        description: result.description,
        duration: result.duration,
        date: result.date.toDateString(),
        _id: user._id.toString()
    });
});
router.get('/users/:_id/logs',async (req,res)=>{
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const filters = [
        {$match: {_id: new mongoose.Types.ObjectId(userId)}},        
        {
            $lookup: {
              from: 'exercises',
              localField: '_id',
              foreignField: 'userId',
              as: 'logs'
            }
        },
        {$unwind: '$logs'},
    ];
    if(from){
        filters.push({
            $match: {
                'logs.date': {
                    "$gte": new Date(from)
                }
            }
        })
    }
    if(to){
        filters.push({
            $match: {
                'logs.date': {
                    "$lte" : new Date(to)
                }
            }
        })
    }
    if(limit){
        filters.push({
            $limit: Number(limit),
        });
    }
    const result = await User.aggregate([
        ...filters,
        {
            $group: {
                _id: {_id: '$_id', username: '$username'},
                count: {$count: {}},
                log: {
                    $push: {
                        description: '$logs.description',
                        duration: '$logs.duration',
                        date: '$logs.date',
                    }
                },
            }
        },
        {
            $project: {
              _id: '$_id._id',
              username: '$_id.username',
              count: '$count',
              log: '$log'
            }
          }        
      ]);

      result.map(r => {
        r.log = r.log.map(e => ({
            ...e,
            date: e.date.toDateString(),        
        }));
        return r;
      });

    res.json(result.length ? result[0] : []);
});


module.exports = router;