import jwt, {JwtPayload} from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

interface NewRequest extends Request{
    userId?:string,
    publickey?:string
}

export function AuthMiddleware(req:NewRequest,res:Response,next:NextFunction){
    console.log("reached middleware...getting headers .....")
    const token = req.headers.authorization;
    if(!token){
        console.log("token not found!!!!")
        return res.json({message:"Not In DB"});
        
    }
    try{
        const decoded = jwt.verify(token,JWT_SECRET) as JwtPayload;
        req.userId = decoded.userId;
        req.publickey = decoded.publicKey;
        next();
        console.log("forward ho gya")

    }
    catch(e){
        console.log("kuch to gadbad hai ",e)
        return res.json({message:"error"})
    }
}

export function SocketMiddleware(socket: any, next: (err?: Error) => void){
    console.log("In socket middleware");
    const token = socket.handshake.auth.authorization;
    if(!token){
        console.log("token not found");
        socket.data.userId = null;
        socket.data.isGuest = true;
        return next();
        
        
    }
    try{
        const decoded = jwt.verify(token , JWT_SECRET) as JwtPayload;
        socket.data.userId = decoded.userId;
        socket.data.publicKey = decoded.publicKey;
        next();
        console.log("fwd ho gya socket middleware se ")
    }
    catch(e){
        console.log("some err" , e);
        socket.data.userId = null;
    socket.data.isGuest = true;
    return next();
    }
}