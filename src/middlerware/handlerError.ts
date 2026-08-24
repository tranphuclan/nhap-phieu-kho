import express from "express";

export const handlerError = (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
) => {
    console.error(error);
    res.status(500).send("Có lỗi xảy ra. Vui lòng thử lại.");
}