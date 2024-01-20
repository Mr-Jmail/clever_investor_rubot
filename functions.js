const path = require("path")
const fs = require("fs")
const questionsFilePath = path.join(__dirname, "questions.json")
const statisticsFilePath = path.join(__dirname, "statistics.json")
const usersFilePath = path.join(__dirname, "users.json")

async function getQuestions() {
    // console.log(JSON.parse(fs.readFileSync(questionsFilePath, "utf-8")))
    return JSON.parse(fs.readFileSync(questionsFilePath, "utf-8"))
}

async function getQuestion(questionNumber) {
    var questions = await getQuestions().catch(err => console.log(err))
    return questions[questionNumber - 1]
}

async function editQuestion(questionNumber, keyToEdit, newValue) {
    var questions = await getQuestions()
    questions = questions.map((question, idx) => {
        if(idx != questionNumber - 1) return question
        question[keyToEdit] = newValue
        return question
    })
    fs.writeFileSync(questionsFilePath, JSON.stringify(questions, null, 4), "utf-8")
}

async function sendQuestion(questionNumber, ctx, editMessage) {
    var { text, photo, document, keyboard } = await getQuestion(questionNumber)
    var reply_markup = (keyboard[0]?.[0]?.request_contact) ? { keyboard, one_time_keyboard: true, resize_keyboard: true } : { inline_keyboard: keyboard, resize_keyboard: true };
    if(editMessage) return await ctx.editMessageMedia({type: photo ? "photo" : "document", media: photo ?? document, caption: text}, {reply_markup, one_time_keyboard: true}).catch(err => console.log(err))
    if(document && document.length != 0) return await ctx.sendDocument(document, {caption: text, reply_markup, one_time_keyboard: true}).catch(err => console.log(err))
    if(photo && photo.length != 0) return await ctx.replyWithPhoto(photo, {caption: text, reply_markup, one_time_keyboard: true}).catch(err => console.log(err))
    if(keyboard.length == 0) keyboard.push([])
    return await ctx.reply(text, {reply_markup, one_time_keyboard: true}).catch(err => console.log(err))
}

async function getStatistics() {
    return { allUsers, usersCompletedSurvey } = JSON.parse(fs.readFileSync(statisticsFilePath, "utf-8"))
}

async function pushUserToStatistics(chatId, isUserCompletedSurvey = false) {
    var { allUsers, usersCompletedSurvey } = await getStatistics()
    if(isUserCompletedSurvey && !usersCompletedSurvey.includes(chatId)) usersCompletedSurvey.push(chatId)
    else if(!isUserCompletedSurvey && !allUsers.includes(chatId)) allUsers.push(chatId)
    fs.writeFileSync(statisticsFilePath, JSON.stringify({ allUsers, usersCompletedSurvey }, null, 4), "utf-8")
}

async function getUsers() {
    return JSON.parse(fs.readFileSync(usersFilePath, "utf-8"))
}

async function updateUser(chatId) {
    var users = await getUsers()
    var user = users.find(user => user.chatId == chatId)
    
    var time = new Date().getTime()

    if(user) user.time = time
    else users.push({chatId, time: new Date().getTime()})

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 4), "utf-8")
}

async function deleteUser(chatId) {
    var users = await getUsers()
    users = users.filter(user => user.chatId != chatId)
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 4), "utf-8")
}

module.exports = { getQuestions, getQuestion, editQuestion, sendQuestion, getStatistics, pushUserToStatistics, getUsers, updateUser, deleteUser }