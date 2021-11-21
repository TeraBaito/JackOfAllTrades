const { get, post } = require('axios').default;

module.exports = async (secret, userID) => {
    // Gets oauth token given the application secret
    const { data: res1 } = await post('https://osu.ppy.sh/oauth/token', 
        {
            client_id: '9921',
            client_secret: secret,
            grant_type: 'client_credentials',
            scope: 'public'
        }
    ).catch(e => console.error(e));
    const oauth = res1.token_type + ' ' + res1.access_token;

    // Requests user for each mode and maps playcounts to an array
    const urlConstruct = (mode) => `https://osu.ppy.sh/api/v2/users/${userID}/${mode}?key=id`;
    const headers = {
        'Authorization': oauth,
        'Content-Type': 'application/json'
    };

    const playcounts = (await Promise.all([
        get(urlConstruct('osu'), { headers }).catch(e => console.error(e)),
        get(urlConstruct('taiko'), { headers }).catch(e => console.error(e)),
        get(urlConstruct('fruits'), { headers }).catch(e => console.error(e)),
        get(urlConstruct('mania'), { headers }).catch(e => console.error(e))
    ])).map(r => r.data.statistics.play_count);

    return playcounts;
};