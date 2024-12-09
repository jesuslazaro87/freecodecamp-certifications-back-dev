const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExerciseSchema = new Schema({
    description: String,
    duration: Number,
    date: Date,
    userId: {type: mongoose.Types.ObjectId, ref: 'User'},
},{ versionKey: false });

module.exports = mongoose.model('Exercise', ExerciseSchema);