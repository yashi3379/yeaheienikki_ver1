const Joi = require('joi');


module.exports.diarySchema = Joi.object({
    diary: Joi.object({
        content: Joi.string().required().min(10).max(200),

    }).required()
});


// const DiarySchema = new Schema({
//     content: {
//         type: String,
//         required: true
//     },
//     date: {
//         type: String,
//     },
//     translate:{
//         type: String,
//     },
//     author: {
//         type: Schema.Types.ObjectId,
//         ref: 'User'
//     }
// });
