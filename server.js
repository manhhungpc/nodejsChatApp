var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongoose = require("mongoose");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.Promise = Promise;
var dbURL =
  "mongodb+srv://user:user@learningnodejs.3z5dj.mongodb.net/learningNodejs?retryWrites=true&w=majority";

var Message = mongoose.model("Message", {
  name: String,
  message: String,
});

app.get("/message", (req, res) => {
  Message.find({}, (err, messages) => {
    //gửi dữ liệu từ db đến người dùng
    res.send(messages);
  });
});

app.post("/message", async (req, res) => {
  try {
    var message = new Message(req.body);
    var savedMessage = await message.save();

    console.log("saved");
    //then try to find 'badword'
    var censored = await Message.findOne({ message: "badword" });

    //then deleted if has 'badword'
    if (censored) {
      await Message.deleteOne({ _id: censored.id });
    } else io.emit("message", req.body); //send the message from client to server
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
    return console.error(err);
  } finally {
    console.log("message post executed");
  }
});

io.on("connection", (socket) => {
  console.log("a user connect");
});

mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  console.log("connected to db - ", err);
});
var server = http.listen(3000, () => {
  console.log(`server is listening on ${server.address().port}`);
});
