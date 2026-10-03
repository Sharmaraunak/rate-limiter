import express, {type NextFunction, type Request, type Response} from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

type Bucket = {
    token: number;
    lastRefillTime: number;
}

const map: Record<string, Bucket> = {};
const CAPACITY = 10;
const REFILL_RATE = 10 / 60; // tokens per second

function rateLimiter(req: Request, res: Response, next: NextFunction) {

    // get the ip of the request
    const ip = req.ip || "127.0.0.1";

    // logging for the testing purpose
    console.log(ip, map);

    // if ip in map then update otherwise add the ip in the map
    if (map[ip]) {
        const bucket = map[ip];
        // elapsed time in seconds
        const elapsedTime = (Date.now() - bucket?.lastRefillTime) / 1_000;

        // tokenEarned calculation
        const refillToken: number = Math.min((bucket?.token + (elapsedTime * (REFILL_RATE))), CAPACITY);

        if (refillToken >= 1) {
            map[ip] = {token: refillToken - 1, lastRefillTime: Date.now()};


        } else {
            return res.sendStatus(429);
        }
        return next()

    } else {
        map[ip] = {token: CAPACITY - 1, lastRefillTime: Date.now()};
        return next();
    }

}

app.get("/api/data", rateLimiter, (req, res) => {
    return res.status(200).json({
        "message": "success",
    })
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
