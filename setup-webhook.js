require('dotenv').config();

async function subscribeToWebhook() {
    const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            callback_url: `${process.env.BASE_URL}/strava/webhook`,
            verify_token: process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
        })
    });

    const result = await response.json();
    console.log('Webhook subscription result:', result);
}

subscribeToWebhook(); 