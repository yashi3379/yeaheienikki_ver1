const express = require('express');
const router = express.Router();

const diary = require('../controllers/diary');

const { diarySchema } = require('../schemas');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { isLoggedIn } = require('../middleware');

const validateDiary = (req, res, next) => {
    const { error } = diarySchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.route('/:id')
    .get(isLoggedIn, catchAsync(diary.mainPageIndex))
    .post(isLoggedIn, validateDiary, catchAsync(diary.createDiary));

router.route('/:id/new')
    .get(isLoggedIn, diary.renderNewForm);

module.exports = router;
