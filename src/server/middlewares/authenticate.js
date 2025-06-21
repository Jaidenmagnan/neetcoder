const { verify } = require('jsonwebtoken');
const { UserAuth } = require('../../models.js');
module.exports = async (request, response, next) => {
    const token = request.cookies.token;
    try {
        const { sub } = await verify(token, process.env.JWT_SECRET);
        request.user = await UserAuth.findOne({ where: { discordId: sub } });
    } catch (error) {
        request.user = null;
    }
    await next();
}

