import { Request, Response } from "express";
import { Db } from "mongodb";
import { v4 as uuid } from "uuid";

const checkDateValidity = (
  day: string,
  month: string,
  year: string
): boolean => {
  const date1 = new Date();
  const day1 = date1.getDate();
  const month1 = date1.getMonth() + 1;
  const year1 = date1.getFullYear();
  const date2 = new Date(`${month1} ${day1}, ${year1}`);
  const date = new Date(`${month} ${day}, ${year}`);
  return date2 <= date;
};


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
    return res.status(500).send("Falta día, mes o año");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Invalido día, mes o año");
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
    return res.status(500).send("No hay parametros");
  }

  const { day, month, year, number } = req.query as {
    day: string;
    month: string;
    year: string;
    number: string;
  };

  if (!day || !month || !year || !number) {
    return res.status(500).send("Falta dia,  mes, año o número de sitio");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Invalido día, mes o año");
  }

  const notFree = await collection.findOne({ day, month, year, number });
  if (notFree) {
    return res.status(404).send("Sitio no disponible");
  }

 const us = db.collection("Usuarios").findOne({auth_token: req.header('auth_token')})
 if(us){
  await collection.insertOne({ day, month, year, number, user: us });

  return res.status(200).json( {seat:number ,date: day,month,year});
 }else{

 }
};

export const free = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");
  const collection = db.collection("Reservas");
  if (!req.query) {
    return res.status(500).send("No hay parametros");
  }

  const { day, month, year } = req.body as {
    day: string;
    month: string;
    year: string;
  };



  if (!day || !month || !year) {
    return res
      .status(500)
      .send("Falta dia,  mes, año o número de sitio ");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Dia, mes o año invalidos");
  }
  const us = db.collection("Usuarios").findOne({auth_token: req.header('auth_token')})
  const booked = await collection.findOne({ day, month, year, us });
  if (booked) {
    await collection.deleteOne({ day, month, year, us });
    return res.status(200).send("Sitio liberado");
  }

  return res.status(404).send("Sitio no reservado con mi usuario");
};






export const mybookings = async (req: Request, res: Response) => {
  const date = new Date();
  const day1 = date.getDate();
  const month1 = date.getMonth() + 1;
  const year1 = date.getFullYear();

  const db: Db = req.app.get("db");
  const char = await db.collection("Usuarios").findOne({ auth_token: req.headers.auth_token});

  const reser = await db.collection("Reservas").find({day:{$gte: day1},month:{$gte: month1},year:{$gte: year1}, user: char}).toArray();
  if(reser){
    res.status(200).json({reservas:reser});
  }else {
    res.status(404).json("No hay reservas futuras con tú usuario");
  }
}



export const login = async (req: Request, res: Response) => {
    const email = req.body.email as string;
    const password = req.body.password as string;

    const db: Db = req.app.get("db");

  const char = await db.collection("Usuarios").findOne({ email: email ,password: password});

    if(char) {
 
        const token = uuid();
         db.collection("Usuarios").updateOne(
            { email: email, password: password},
            { $set: { auth_token: token } }
        );
        res.status(200).send({auth_token: token});
      

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
  const token = req.headers.auth_token;
 
    const db: Db = req.app.get("db");

    if(token){
       await db.collection("Usuarios").updateOne(
            { auth_token: token},
            { $set: { auth_token: undefined } }
        );
        res.status(200).json({mensaje: 'Se cerro sesión'});
    }else{
      res.status(500).json({ mensaje: "No se pudo cerrar sesión"});
    }
    

}