require('dotenv').config();

const auth0Endpoint = "https://kpi.eu.auth0.com/oauth/token";

const requestBody = {
    grant_type: "http://auth0.com/oauth/grant-type/password-realm",
    audience: "https://kpi.eu.auth0.com/api/v2/",
    client_id: "JIvCO5c2IBHlAe2patn6l6q5H35qxti0",
    client_secret: "ZRF8Op0tWM36p1_hxXTU-B0K_Gq_-eAVtlrQpY24CasYiDmcXBhNS6IJMNcz1EgB",
    scope: "offline_access",
    realm: "Username-Password-Authentication",
};

async function getAccessToken(username, password) {
    const body = Object.assign(requestBody, { username, password }); // Create a new object
    try {
        const res = await fetch(auth0Endpoint, {
            method: "Post",
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if(!res.ok) throw new Error('${res.status} - ${res.statusText}');

        const data = await res.json();
        console.log('Token: ', data);
        return data.access_token;
    }catch(e){
        console.error('Error: '+ e);
    }
}

module.exports = getAccessToken