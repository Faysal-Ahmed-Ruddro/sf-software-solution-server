const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const admin = require("firebase-admin");
const port = process.env.PORT || 8000;


// sf-software-solution-firebase-adminsdk.json
var serviceAccount = require("./sf-software-solution-firebase-adminsdk.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qrkkr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


async function verifyToken(req,res,next) {
  if(req?.headers?.authorization.startsWith("Bearer")){
    const token = req.headers.authorization.split(" ")[1] ;

    try{
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
    }
    catch{

    }

  }


  next()
}

async function run() {
  try {
    await client.connect();
    const database = client.db("SF-Software-Solution");
    const servicesCollection = database.collection("services");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");

    // SERVEICES AREA /////////////////////

    // servicess Post API
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });
    // Services GET API
    app.get("/services", async (req, res) => {
      const services = servicesCollection.find({});
      const result = await services.toArray();
      res.send(result);
    });
    // single Services  get api
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.json(result);
    });

    //ORDERS AREA ////////////////////

    // Orders post API
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.json(result);
    });
    //  OREDERS GET API
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const orders = ordersCollection.find(query);
      const result = await orders.toArray();
      res.json(result);
    });

    // user area

    // user post api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
     
    // user get api 

    app.get("/users/:email",async(req,res)=>{
      const email =  req.params.email;
      const query = {email:email};
      const user = await usersCollection.findOne(query)
      let isAdmin = false;
      if(user.role === "admin"){
        isAdmin = true;
      }
      res.json({admin:isAdmin})
    })
    //  user put api
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // admin PUT API 
    app.put("/users/admin",verifyToken, async(req,res)=>{
      const user = req.body;
      const requester = req.decodedEmail;
      if(requester){
        const requesterAccount = await usersCollection.findOne({email:requester});
        if(requesterAccount.role === 'admin'){
          const filter = { email: user.email };
          const updateDoc = { $set: { role: "admin" } };
          const result = await usersCollection.updateOne(filter, updateDoc);
          console.log(result);
          res.json(result);
        }
      }
      else{
        res.status(403).json({message:"You don't have access to make admin"})
      }
      
    })
  } finally {
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
