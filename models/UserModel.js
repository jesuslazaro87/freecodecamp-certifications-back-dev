const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: Schema.Types.String,
});

module.exports = mongoose.model('User', UserSchema);