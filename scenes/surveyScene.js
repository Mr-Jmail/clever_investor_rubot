const { Scenes } = require("telegraf")
const { sendQuestion, getQuestion, updateUser, deleteUser } = require("../functions")
const fetch = require("node-fetch")
const crypto = require('crypto');
const { faker } = require('@faker-js/faker');

module.exports = new Scenes.WizardScene("surveyScene", 
    async ctx => {
        ctx.scene.session.state = { variantsOfAnswer: [], firstName: "", lastName: "", phone: "" }
        await sendQuestion(1, ctx)
        await saveVariantsOfAnswer(1, ctx)
        await updateUser(ctx.from.id)
        return ctx.wizard.next()
    },
    async ctx => {
        if(ctx?.message?.text == "/cancel") return ctx.scene.leave()
        if(await checkVariantsOfAnser(ctx)) return
        await sendQuestion(2, ctx)
        await saveVariantsOfAnswer(2, ctx)
        await updateUser(ctx.from.id)
        return ctx.wizard.next()
    },
    async ctx => {
        if(ctx?.message?.text == "/cancel") return ctx.scene.leave()
        if(await checkVariantsOfAnser(ctx)) return
        await sendQuestion(3, ctx)
        await saveVariantsOfAnswer(3, ctx)
        await updateUser(ctx.from.id)
        return ctx.wizard.next()
    },
    async ctx => {
        if(ctx?.message?.text == "/cancel") return ctx.scene.leave()
        if(await checkVariantsOfAnser(ctx)) return
        await sendQuestion(4, ctx)
        await saveVariantsOfAnswer(4, ctx)
        await updateUser(ctx.from.id)
        return ctx.wizard.next()
    },
    async ctx => {
        if(ctx?.message?.text == "/cancel") return ctx.scene.leave()
        if(await checkVariantsOfAnser(ctx)) return
        await sendQuestion(5, ctx)
        await saveVariantsOfAnswer(5, ctx)
        await updateUser(ctx.from.id)
        return ctx.wizard.next()
    },
    async ctx => {
        if(ctx?.message?.text == "/cancel") return ctx.scene.leave()
        if(await checkVariantsOfAnser(ctx)) return
        await sendQuestion(6, ctx)
        await saveVariantsOfAnswer(6, ctx)
        await updateUser(ctx.from.id)
        return ctx.wizard.next()
    },
    async ctx => {
        if(ctx?.message?.text == "/cancel") return ctx.scene.leave()
        if(await checkVariantsOfAnser(ctx)) return
        if(/[a-zA-Z0-9]/.test(ctx.message.text)) return await ctx.reply("❌ Введенная Вами имя является некорректной. Пожалуйста, введите вашу фамилию еще раз").catch(err => console.log(err))
        ctx.scene.session.state.firstName = ctx.message.text
        await sendQuestion(7, ctx)
        await saveVariantsOfAnswer(7, ctx)
        await updateUser(ctx.from.id)
        return ctx.wizard.next()
    },
    async ctx => {
        if(ctx?.message?.text == "/cancel") return ctx.scene.leave()
        if(await checkVariantsOfAnser(ctx)) return
        if(/[a-zA-Z0-9]/.test(ctx.message.text)) return await ctx.reply("❌ Введенная Вами фамилия является некорректной. Пожалуйста, введите вашу фамилию еще раз").catch(err => console.log(err))
        ctx.scene.session.state.lastName = ctx.message.text
        await sendQuestion(8, ctx)
        await saveVariantsOfAnswer(8, ctx)
        await updateUser(ctx.from.id)
        return ctx.wizard.next()
    },
    async ctx => {
        if(await checkVariantsOfAnser(ctx)) return
        ctx.scene.session.state.phone = ctx.message.contact.phone_number
        await sendQuestion(9, ctx)
        await deleteUser(ctx.from.id)
        await saveToCRM(ctx.scene.session.state.phone, ctx.scene.session.state.firstName, ctx.scene.session.state.lastName, await generateRandomEmail())
        return ctx.scene.leave()
    }
)

async function saveVariantsOfAnswer(questionNumber, ctx) {
    var keyboard = (await getQuestion(questionNumber)).keyboard
    console.log(`questionNumber: ${questionNumber}`);
    console.log(`keyboard.request_contact: ${keyboard[0]?.[0]?.request_contact}`);
    if(keyboard.length == 0) return ctx.scene.session.state.variantsOfAnswer = []
    if(keyboard[0]?.[0]?.request_contact) return ctx.scene.session.state.variantsOfAnswer = ["request_contact"]
    ctx.scene.session.state.variantsOfAnswer = keyboard.flat().map(button => button.callback_data)
}

async function checkVariantsOfAnser(ctx) {
    console.log("Variants of answer");
    console.log(ctx.scene.session.state.variantsOfAnswer);
    console.log(`CallbackQuery: ${ctx?.callbackQuery?.data}`);
    if(ctx.scene.session.state.variantsOfAnswer.includes("request_contact") && ctx?.message?.contact) {console.log("here"); return false}
    if(ctx.scene.session.state.variantsOfAnswer.length == 0 && !ctx?.message?.text) return await ctx.reply("Введите ответ текстом пожалуйста").catch(err => console.log(err))
    if(ctx.scene.session.state.variantsOfAnswer.length != 0 && !ctx.callbackQuery) return await ctx.reply("Дайте ответ, выбрав одну из кнопок").catch(err => console.log(err))
    if(ctx.scene.session.state.variantsOfAnswer != 0 && !ctx.scene.session.state.variantsOfAnswer.includes(ctx.callbackQuery.data)) return await ctx.reply("Выберите одну из кнопок").catch(err => console.log(err))
}

async function saveToCRM(phoneNumber, firstName, lastName, email) {
    var res = await fetch(new URL(`http://doza-traffic.com/api/wm/push.json?id=${process.env.apiToken}&offer=1&flow=215&site=272&phone=${phoneNumber}&name=${firstName}&last=${lastName}&email=${email}`))
    console.log(await res.json());
}

async function generateRandomEmail() {
    const randomName = faker.internet.userName();
    const randomDomain = faker.internet.domainName();
    const randomHash = crypto.randomBytes(8).toString('hex');
    return `${randomName}_${randomHash}@${randomDomain}`;
}