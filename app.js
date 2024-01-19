if (process.env.NODE_ENV !== "production") {
    {
        require('dotenv').config();
    }
}
const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const methodOverride = require('method-override');

const User = require('./models/user');

const userRoutes = require('./routes/user');
const diaryRoutes = require('./routes/diary');


const ExpressError = require('./utils/ExpressError');

mongoose.connect('mongodb://localhost:27017/yeaheienikkiver1')
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

const app = express();
const path = require('path');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 *24 * 7
    }
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});


app.get('/', (req, res) => {
    res.send('Yeah!英絵日記ver1');
});

app.use('/',userRoutes);

app.use('/diary',diaryRoutes); 


app.all('*', (req, res, next) => {
    next(new ExpressError('ページがみつかりませんでした', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if (!err.message) err.message = '問題が発生しました';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('ポート3000番で起動中');
});
