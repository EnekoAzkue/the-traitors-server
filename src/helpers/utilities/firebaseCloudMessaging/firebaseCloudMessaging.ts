let admin = require('firebase-admin');

export async function sendNotification(token: any , title: any, body: any) {
  const message = {
    notification: {
      title,
      body,

    },
    token,
  };


  // const response = await admin.messaging().send(message);

  const response = await admin.messaging().sendEachForMulticast({
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
          // Required for background/quit data-only messages on iOS
          // Note: iOS frequently will receive the message but decline to deliver it to your app.
          //           This is an Apple design choice to favor user battery life over data-only delivery
          //           reliability. It is not under app control, though you may see the behavior in device logs.
          'content-available': true,
          // Required for background/quit data-only messages on Android
          priority: 'high',
        },
      },
    },
  });


}


