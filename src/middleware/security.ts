import type {Request, Response, NextFunction} from "express";
import aj from "../config/arcjet";
import {ArcjetNodeRequest, slidingWindow} from "@arcjet/node";

const securityMiddleware = async  (req: Request,
                            res: Response, next: NextFunction) => {
//     Ignore security analysis on test environment
    if(process.env.NODE_ENV === 'test') return next();

    try {
        /*

         Middleware that applies role-based rate limiting to every request.
         All requests pass through this middleware.
         If no authenticated user is found, user is set to null
         and default rate limits are enforced.
         Specific users or roles may be granted higher request limits.

         */
        const role: RateLimitRole = req.user ?.role ?? 'guest';

        let limit: number;
        let message: string;

        switch (role) {
            case "admin":
                limit = 20;
                message = "Admin request limit exceeded (20 per minute)";
                break;
            case "teacher":
            case "student":
                limit = 10;
                message = "Student request limit exceeded (10 per minute)";
                break;
            default:
                limit = 5;
                message = "Guest request limit exceeded (5 per minute)";
                break;

        }

    //     Create new arcjet client
        const client = aj.withRule(
            slidingWindow({
                mode: 'LIVE',
                interval: '1m',
                max: limit,
            })
        )
        const arcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: { remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0',},
        }
        const decision = await client.protect(arcjetRequest);

        if(decision.isDenied() && decision.reason.isBot()) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Automated requests are not allowed",
            });
        }

        if(decision.isDenied() && decision.reason.isShield()) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Request blocked by security policy",
            });
        }

        if(decision.isDenied() && decision.reason.isRateLimit()) {
            return res.status(403).json({
                error: "Too many requests are not allowed", message
            });
        }
        next();
    } catch (e) {
        console.error('Arcjet Middleware error ' , e);
        res.status(500).json({
            error: 'Internal Error',
            message: 'Something went wrong with security middleware',
        });
    }
}

export default securityMiddleware;