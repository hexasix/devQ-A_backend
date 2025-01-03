import { Response } from "express";

export function errorResponseHandler(
  res: Response,
  code: number,
  errorMessage: string
) {
  res.status(code).json({ error: errorMessage });
  return;
}
