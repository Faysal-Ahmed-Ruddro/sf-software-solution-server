const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qrkkr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("SF-Software-Solution");
    const servicesCollection = database.collection("services")
    const ordersCollection = database.collection("orders")


    // SERVEICES AREA /////////////////////

    // servicess Post API
    app.post("/services",async (req,res)=>{
        const service = req.body;
        const result = await servicesCollection.insertOne(service)
        res.send(result)
    })
    // Services GET API
    app.get("/services", async (req,res)=>{
      const services = servicesCollection.find({})
      const result = await services.toArray()
      res.send(result)
    })
    // single Services  get api
    app.get("/services/:id", async(req,res)=>{
      const id = req.params.id;
      const query = { _id : ObjectId(id)}
      const result = await servicesCollection.findOne(query)
      res.json(result)
    })

    //ORDERS AREA ////////////////////

    // Orders post API
       app.post("/orders", async (req, res) => {
         const orders = req.body;
         const result = await ordersCollection.insertOne(orders);
         res.json(result);
       });

    
  }finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Server created
app.get("/", (req, res) => {
  res.send("Server Is Ready");
});
app.listen(port, () => {
  console.log("Server Is Running on", port);
});
