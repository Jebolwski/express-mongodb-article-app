const joi = require("joi");

const registerValidation = (data) => {
  const schema = joi.object({
    username: joi.string().min(6).required(),
    email: joi.string().min(6).required().email(),
    password: joi.string().min(8).required(),
    role: joi.number().default(0),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = joi.object({
    email: joi.string().min(6).required().email(),
    password: joi.string().min(8).required(),
  });
  return schema.validate(data);
};

const articleValidation = (data) => {
  const schema = joi.object({
    name: joi.string().max(60).required(),
    desc: joi.string().max(180).required(),
    file: joi.object(),
    user: joi.object(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.articleValidation = articleValidation;
module.exports.loginValidation = loginValidation;
