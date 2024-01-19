const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const deepl = require('deepl-node');
const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

const cloudinary = require('../cloudinary');
const { v4: uuidv4 } = require('uuid');


const Diary = require('../models/diary');
const User = require('../models/user');

//cloudinaryにアップロードする
const cloudinaryUpload = async (image) => {
    const result = await cloudinary.uploader.upload(image, {
        upload_preset: 'yeah-diary-ver1'
    });
    return result;
}

//DeepLで英訳する
const translation = async (prompt) => {
    const translationResult = await translator.translateText(prompt, 'ja', 'en-US');
    const resultTransrate = translationResult.text;
    return resultTransrate;
}
//OpenAIのDALL-3で画像を生成する
const generateImageURL = async (prompt) => {
    const response = await openai.images.generate({ model: "dall-e-3", prompt, n: 1, size: "1024x1024" });
    const generatedImageURL = response.data[0].url;
    return generatedImageURL;
}

module.exports.mainPageIndex = async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    const diaries = await Diary.find({ author: id })
    res.render('diary/index', { user, diaries });
}

module.exports.renderNewForm = (req, res) => {
    res.render('diary/new');
}

module.exports.createDiary = async (req, res) => {
    if (!req.body.diary) throw new ExpressError('無効な日記です', 400);
    const diary = new Diary(req.body.diary);
    //diary.dateを日本時間で設定する
    diary.date = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
    //diary.authorをreq.params.idに設定する
    diary.author = req.params.id;
    //diary.contentを英訳する
    const prompt = diary.content;
    const resultTransrate = await translation(prompt);
    diary.translate = resultTransrate;
    //DALL-3でdiaryImageを生成して、urlだけを取得する
    const aiImageURL = await generateImageURL(diary.translate);
    //cloudinaryにアップロードする
    const cloudinaryResult = await cloudinaryUpload(aiImageURL);
    diary.image.cloudinaryURL = cloudinaryResult.secure_url;
    //diary.image._idをuuidで生成する
    diary.image._id = uuidv4();
    if (diary.translate === undefined) {
        throw new ExpressError('英訳に失敗しました', 400);
    }
    if (diary.image.cloudinaryURL === undefined) {
        throw new ExpressError('画像生成またはアップロードに失敗しました', 400);
    }
    await diary.save();
    req.flash('success', '日記を作成しました');
    res.redirect(`/diary/${req.params.id}`);
}

