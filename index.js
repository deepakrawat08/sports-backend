require("dotenv").config();
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
		process.env.MONGODB_ENV ||
			"mongodb+srv://deepak_rawat_07:Deepak07@mongodb@rawat.llerx.mongodb.net/sports?retryWrites=true&w=majority",
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

		app.listen(PORT, () => console.log(`Express running on ${PORT}`))
	});
