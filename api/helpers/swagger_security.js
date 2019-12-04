const db = require('../db');

module.exports = {
    swaggerSecurityHandlers: {
        APIKeySecurity: async function(req, authOrSecDef, scopesOrApiKey, callback)
        {
            if(authOrSecDef)
            {
                if(req.header('X-Session-ID'))
                {
                    let sessionId = req.header('X-Session-ID');
                    let sessions = await db.getSessions();
                    if(sessions.filter(x=>x._sessionId === sessionId).length > 0)
                    {
                        callback();
                    }
                    else
                    {
                        callback(new Error('Unknown Session Id!'))
                    }
                }
                else
                {
                    callback(new Error('No API Key!'));
                }
            }
        }
    }
}