import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export interface AuthUserInformation {
  id: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserInformation;
    }
  }
}

export class Middleware {
  verifyAuth = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(401).send({
          code: 401,
          message: "Unauthorized",
        });
        return;
      }

      jwt.verify(token, process.env.SECRET_KEY!, (err, user) => {
        if (err) {
          return res.status(403).send({
            code: 403,
            message: "Forbidden",
          });
        }

        req.user = user as AuthUserInformation;
        next();
      });
    };
  };
}
