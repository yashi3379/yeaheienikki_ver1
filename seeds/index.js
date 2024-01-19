const mongoose = require('mongoose');
const Diary = require('../models/diary');
const User = require('../models/user');

const demouser =  require('./demoUser');
const demodiary = require('./demoDiary');


mongoose.connect('mongodb://localhost:27017/yeaheienikkiver1')
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

const seedDB = async() => {
    await Diary.deleteMany({});
    // await User.deleteMany({});
    //dinaryの中身をuserと紐付け内で別々に作成する
    const userLength = demouser.length;
    const diaryLength = demodiary.length;
    // for (let i = 0; i < userLength; i++) {
    //     const user = new User(demouser[i]);
    //     await user.save();
    // }
    for(let i = 0; i < diaryLength; i++) {
        const diary = new Diary(demodiary[i]);
        await diary.save();
    }
   
    
}

seedDB().then(() => {
    mongoose.connection.close();
});