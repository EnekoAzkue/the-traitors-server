import playerServices from "../../../services/playerServices";
import { sendNotification, sendScrollNotification } from "../firebaseCloudMessaging/firebaseCloudMessaging";

export async function sendNotificationToMortimer(message: any) {
    const mortimer = await playerServices.getMortimerUser();
    if (!mortimer?.pushToken) return;
    
    const { title, body } = message?.notification || {};
    const scrollMessage = message?.data?.scrollMessage;
    
    if (title === "Pergamino encontrado") {
        sendScrollNotification(
            mortimer.pushToken,
            title,
            body,
            String(scrollMessage) // << garantizar string
        );
    } else {
        sendNotification(mortimer.pushToken, title, body);
    }
}