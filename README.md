# deepest-paths

Hi, Keane. If you're reading this, it's probably because Dr. Day asked you to pick this project back up in the future, and you have no clue how to access or modify any of the firebase stuff. Well, you're in luck. You don't know how to do that right now either.

If you do need to modify anything in the app, use Command Prompt to navigate to this folder, and run the command 'firebase deploy'. This will publish any changes in the source folder to the live app. 

In addition, to roll out live changes, the `appWithoutAPIKey.js` will need to be renamed to simply `app.js`. Then, you will need to put the API key in `firebaseConfig`.