const { verify } = require('jsonwebtoken');
const { UserAuth } = require('../../models.js');
module.exports = async (request, response, next) => {
    const token = request.cookies.token;
    try {
        const { sub, token_type, access_token} = await verify(token, process.env.JWT_SECRET);
        request.user = await UserAuth.findOne({ where: { discordId: sub } });
        request.token_type = token_type;
        request.access_token = access_token;
    } catch (error) {
        request.user = null;
        request.token_type = null;
        request.access_token = null;
    }
    await next();
}

