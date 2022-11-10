const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectID, ObjectId } = require("bson");
const { query } = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// user : carperDbUser
// pass : shvWcrAwZ2og7MWY

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ui8slz3.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

// CRUD operation
async function run() {
	try {
		const serviceCollection = client.db("carperDb").collection("services");

		const reviewCollection = client.db("carperDb").collection("reviews");

		const addServiceCollection = client.db("carperDb").collection("addService");
//----------------------------------
		// verify jwt :
		function verifyJWT(req, res, next) {
			const authHeader = req.headers.authorization;
			if (!authHeader) {
				return res.status(401).send({ message: "unauthorided access" });
			}
			const token = authHeader.split(" ")[1];
			jwt.verify(
				token,
				process.env.ACCESS_TOKEN_SECRET,
				function (err, decoded) {
					if (err) {
						return res.status(401).send({ message: "unauthorided access" });
					}
					req.decoded = decoded;
					next();
				}
			);
		}

		// jwt token create
		app.post("/jwt", (req, res) => {
			const user = req.body;
			// console.log(user);

			const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: "1d",
			});
			res.send({ token });
		});

        //------------------------------------------

		app.get("/services", async (req, res) => {
			const query = {};
			const cursor = serviceCollection.find(query);
			const services = await cursor.toArray();
			res.send(services);
		});
		app.get("/services/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectID(id) };
			const service = await serviceCollection.findOne(query);
			res.send(service);
		});

		// checkbox add service
		app.post("/addService", async (req, res) => {
			const addservice = req.body;
			const result = await addServiceCollection.insertOne(addservice);
			res.send(result);
		});

		// add service load kora by email
		app.get("/addService", async (req, res) => {
			let query = {};
			if (req.query.email) {
				query = {
					email: req.query.email,
				};
			}
			const cursor = addServiceCollection.find(query);
			const service = await cursor.toArray();
			console.log(service);
			res.send(service);
		});

		// review api
		app.post("/reviews", async (req, res) => {
			const review = req.body;
			const result = await reviewCollection.insertOne(review);
			res.send(result);
		});

		// get review api from db
		app.get("/reviews",verifyJWT, async (req, res) => {
			console.log(req.headers);
			const decoded = req.decoded;
			if(decoded.email !== req.query.email){
			    res.status(403).send({message : 'unathorized access'})
			}
			let query = {};
			if (req.query.email) {
				query = {
					email: req.query.email,
				};
			}
			const cursor = reviewCollection.find(query);
			const review = await cursor.toArray();
			res.send(review.reverse());
		});

		// update review  :
		app.patch("/reviews/:id", async (req, res) => {
			const id = req.params.id;
			const status = req.body.status;
			const query = { _id: ObjectId(id) };
			const updatedDoc = {
				$set: {
					status: status,
				},
			};
			const result = await reviewCollection.updateOne(query, updatedDoc);
			res.send(result);
		});

		// delete review
		app.delete("/reviews/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await reviewCollection.deleteOne(query);
			res.send(result);
		});
	} finally {
	}
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
	res.send("server is running");
});

app.listen(port, () => {
	console.log(`wood service server is running on ${port}`);
});
