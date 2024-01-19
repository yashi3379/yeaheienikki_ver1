const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('./user/register');
}

module.exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'ユーザーを作成しました');
            res.redirect(`/diary/${registeredUser._id}`);
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('./user/login');
}

module.exports.login =  (req, res) => {
    req.flash('success', 'ログインしました');
    res.redirect(`/diary/${req.user._id}`);
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash('success', 'ログアウトしました');
        res.redirect('/');
    })
}