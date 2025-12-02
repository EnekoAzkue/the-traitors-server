import playerService from "../../../services/playerServices";
let admin = require('firebase-admin');
export async function sendNotification(token: any , title: any, body: any) {
  await admin.messaging().sendEachForMulticast({
    tokens: [token], // ['token_1', 'token_2', ...]
    data: { 
      screen: "",
    },
    notification: {
      title: title,
      body: body,
    },
    apns: {
      payload: {
        aps: {
          'content-available': true,
          priority: 'high',
        },
      },
    },
  });
}

export async function sendScrollNotification(token: string, title: string, body: string, scrollMessage: string) {
  const response = await admin.messaging().sendEachForMulticast({
    tokens: [token],
    data: {
      scrollMessage: 'An acolyte has found a scroll: '
    },
    notification: {
      title,
      body,
    },
    apns: {
      payload: {
        aps: {
          'content-available': true,
        },
      },
    },
    android: {
      priority: 'high',
    },
  });

  return response;
}

export async function sendNotificationToAllAcolytes(title: string, body: string) {
  const allAcolytesPusTokens =  await playerService.getAllAcolytesPushTokens();
  await admin.messaging().sendEachForMulticast({
    tokens: allAcolytesPusTokens,
    data: { 
      
    },
    notification: {
      title: title,
      body: body,
    },
    apns: {
      payload: {
        aps: {
          'content-available': true,
          priority: 'high',
        },
      },
    },
  });
}