import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (err: any) {
      res.status(400).json({ errors: err.errors });
    }
  };
