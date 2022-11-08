const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID } = require('bson');
require('dotenv').config()
// const jwt = require('jsonwebtoken')


const app = express()
const port = process.env.PORT || 5000;

// middle wares
app.use(cors())
app.use(express.json());


// user : carperDbUser
// pass : shvWcrAwZ2og7MWY

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ui8slz3.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// CRUD operation 
async function run(){
    try{
        const serviceCollection = client.db('carperDb').collection('services')


        app.get('/services', async(req,res) =>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id : ObjectID(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })
    }
    finally{

    }
}
run().catch(err =>console.error(err))

app.get('/', (req,res) =>{
    res.send('server is running')
})

app.listen(port, () =>{
    console.log(`wood service server is running on ${port}`);
})