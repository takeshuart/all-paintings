// chatgpt Question and Answer
require('dotenv').config();
// const { Configuration, OpenAIApi } = require("openai");
const OpenAI = require('openai');


const openai = new OpenAIApi({
    api_key: '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'
  });
openai.createCompletion({
    model: "text-davinci-003",
    prompt: "翻译 'Hello, world!' 到中文",
    max_tokens: 50
})
    .then(response => {
        console.log(response.data.choices[0].text.trim());
    })
    .catch(error => {
        console.error("Error:", error);
    });
