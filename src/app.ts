import { Db } from "mongodb";
import { connectDB } from "./mongo";
import express from "express";
import { book, free, freeSeats, mybookings,status, signin, login, logout } from "./resolvers";

const run = async () => {
  const db: Db = await connectDB();
  const app = express();
  app.set("db", db);

  app.use((req, res, next) => {
    next();
  });
  const bodyParser = require('body-parser');
  
  
  
  //app.use(bodyParser);
  app.use(express.json());
 

  /*
  app.use(["/logout","/freeSeats","/free","/book","/mybookings"], async(req, res, next) => {

    //comprobamos que el token y usuario que se mete existe en la base de datos si es asi next
    //falta escribirlo
    const token = req.header('auth_token');
    if(token != undefined ){
      const char = await db.collection("Usuarios").findOne({ token: token});
      if(char) next();
      else{
        res.status(403).send("Tienes que iniciar sesion primero");
      }
   }else{
        res.status(403).send("Tienes que iniciar sesion primero");
   }
  });
  */
  app.get("/status", status);
  app.post("/signin", signin);
  app.post("/login", login);
  app.post("/logout", logout);



 
  app.get("/freeSeats", freeSeats);
  app.post("/book", book);
  app.post("/free", free);
  app.get("/mybookings", mybookings);
  await app.listen(3000
    );
};

try {
  run();
} catch (e) {
  console.error(e);
}