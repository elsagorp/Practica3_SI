import { Request, Response } from "express";
import { Db } from "mongodb";
import { v4 as uuid } from "uuid";

const checkDateValidity = (
  day: string,
  month: string,
  year: string
): boolean => {
  const date = new Date(`${month} ${day}, ${year}`);
  return date.toString() !== "Invalid Date";
};
/*
const checkAuth = (
    auth_token: string
  ): boolean => {
    const char = await db.collection("Usuarios").findOne({ auth_token});
    return date.toString() !== "Invalid Date";
  };*/

export const status = async (req: Request, res: Response) => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  res.status(200).send(`${day}-${month}-${year}`);
};

export const freeSeats = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");
  const collection = db.collection("Reservas");

  if (!req.query) {
    return res.status(500).send("No params");
  }

  const { day, month, year } = req.query as {
    day: string;
    month: string;
    year: string;
  };

  if (!day || !month || !year) {
    return res.status(500).send("Missing day, month or year");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Invalid day, month or year");
  }

  const seats = await collection.find({ day, month, year }).toArray();

  const freeSeats = [];
  for (let i = 1; i <= 20; i++) {
    if (!seats.find((seat) => parseInt(seat.number) === i)) {
      freeSeats.push(i);
    }
  }
  return res.status(200).json({ free: freeSeats });
};

export const book = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");
  const collection = db.collection("Reservas");
  if (!req.query) {
    return res.status(500).send("No params");
  }

  const { day, month, year, number } = req.query as {
    day: string;
    month: string;
    year: string;
    number: string;
  };

  if (!day || !month || !year || !number) {
    return res.status(500).send("Missing day, month or year or seat number");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Invalid day, month or year");
  }

  const notFree = await collection.findOne({ day, month, year, number });
  if (notFree) {
    return res.status(500).send("Seat is not free");
  }

  const token = uuid();
  await collection.insertOne({ day, month, year, number, token });

  return res.status(200).json({ token });
};

export const free = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");
  const collection = db.collection("Reservas");
  if (!req.query) {
    return res.status(500).send("No params");
  }

  const { day, month, year } = req.query as {
    day: string;
    month: string;
    year: string;
  };

  const token = req.headers.token;

  if (!day || !month || !year || !token) {
    return res
      .status(500)
      .send("Missing day, month or year or seat number or token");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Invalid day, month or year");
  }

  const booked = await collection.findOne({ day, month, year, token });
  if (booked) {
    await collection.deleteOne({ day, month, year, token });
    return res.status(200).send("Seat is now free");
  }

  return res.status(500).send("Seat is not booked");
};






export const mybookings = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");
  const char = await db.collection("Usuarios").findOne({ auth_token: req.body.auth_token});

}



export const login = async (req: Request, res: Response) => {
    const email = req.body.email as string;
    const password = req.body.password as string;

    const db: Db = req.app.get("db");

  const char = await db.collection("Usuarios").findOne({ email: email ,password: password});

    if(char) {
 
        const token = uuid();
         db.collection("Usuarios").updateOne(
            { email: req.query.email, password: req.query.password},
            { $set: { auth_token: token } }
        );
       // req.header.auth_token = token;
        res.status(200).send({auth_token: token});
      
        /*.send({
         mensaje: 'Autenticación correcta',
         token: token
        });*/
    } else {
              res.status(404).json({ mensaje: "Usuario o contraseña incorrectos"})
          }

}
//Crear un usuario
export const signin = async (req: Request, res: Response) => {
    const email = req.body.email as string;
    const password = req.body.password as string;
    const db: Db = req.app.get("db");

    const char = await db.collection("Usuarios").findOne({ email: email, password: password, auth_token: undefined});
   
    if (char) {
        res.status(409).send("Ya existe ese usuario");
    } else {
        db.collection("Usuarios").insertOne({ email: email, password: password, auth_token: undefined});
        res.status(200).json("Te registraste con exito");
    }
    

}

export const logout = async (req: Request, res: Response) => {
    
    const db: Db = req.app.get("db");

    if(req.query.token != undefined){
       await db.collection("Usuarios").updateOne(
            { email: req.query.email, password: req.query.password},
            { $set: { auth_token: undefined } }
        );
        res.status(200).header('auth_token', undefined).json({mensaje: 'Se cerro sesión'});
    }else{
      res.status(500).json({ mensaje: "No se pudo cerrar sesión"});
    }
    

}