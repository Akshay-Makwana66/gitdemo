const express = require("express");
const route = require("./routes");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
mongoose.connect("mongodb+srv://IndrashishRoy:windows10@radon-cohort-cluster.gtmdsvp.mongodb.net/Assignment-DB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,  
    }
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen( 3000, function () {
  console.log("Express app running on port " + 3000);
});

