require("dotenv").config();

const firebase = require('firebase')
require('firebase/auth')
require('firebase/firestore')

const express = require("express");
const app = express();

const mongoose = require("mongoose");

const bodyparser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const auth = require("./routes/auth");
const user = require("./routes/user");
const team = require("./routes/team");
const individual = require("./routes/individual");

app.use(bodyparser.json());
app.use(cookieParser());
app.use(cors());

mongoose
	.connect(
		process.env.DATABASE,
		// ||
		// "mongodb+srv://deepak_rawat_07:Deepak07@mongodb@rawat.llerx.mongodb.net/sports?retryWrites=true&w=majority",
		{
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
		}
	)
	.then(() => {
		const PORT = process.env.PORT || 8000;
		console.log("DB CREATED");

		app.use("/", auth);
		app.use("/", user);
		app.use("/", team);
		app.use("/", individual);

		app.listen(PORT, () => console.log(`Express running on ${PORT}`));
	});
// exports.app = functions.https.onRequest(app);

// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
// 	apiKey: "AIzaSyAEQgk9bIe1q-KCdKLjvmzC3WlD2_Gtovk",
// 	authDomain: "sports-nodejs-test.firebaseapp.com",
// 	databaseURL: "https://sports-nodejs-test-default-rtdb.firebaseio.com",
// 	projectId: "sports-nodejs-test",
// 	storageBucket: "sports-nodejs-test.appspot.com",
// 	messagingSenderId: "695059613608",
// 	appId: "1:695059613608:web:d93d6e9a32fc2cca9abf9d",
// 	measurementId: "G-6RH2V6DZYF"
// };
// firebase.initializeApp(firebaseConfig);