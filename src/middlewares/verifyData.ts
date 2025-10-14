import { getAuth } from "firebase-admin/auth";

async function verifyIdToken(req: any, res: any, next: any) {
  const { idToken } = req.body;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: "POST",
      body: JSON.stringify({
        requestUri: `https://the-traitors-server.onrender.com${req.originalUrl}`,
        postBody: `id_token=${idToken}&providerId=google.com`,
        returnSecureToken: true,
      }),
    }
  );

  const data: any = await response.json();
  const { idToken: firebaseIdToken } = data;
  
  getAuth()
    .verifyIdToken(firebaseIdToken)
    .then((decodedToken) => {
      res.locals.playerEmail = decodedToken.email;
      next();
    })
    .catch(() => {
      return res.status(500).send({
        status: "FAILED",
        data: { error: "The ID token is not valid or has expired." },
      });
    });
  }

  const middleware = {
    verifyIdToken,
  };
  
  export default middleware;