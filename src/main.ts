import express, {type NextFunction, type Request, type Response} from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
const map: Record<string, { count: number, windowStart: number }> = {};

function rateLimiter(req: Request, res: Response, next: NextFunction) {

    // get the ip of the request
    const ip = req.ip || "127.0.0.1";

    // logging for the testing purpose
    console.log(ip, map);

    // if ip in map then update otherwise add the ip in the map
    if (map[ip]) {
        const {count, windowStart} = map[ip];
        if (Date.now() - windowStart >= 60_000) {
            map[ip] = {count: 1, windowStart: Date.now()};
        } else {
            if (count >= 10) {
                return res.sendStatus(429);
            } else {
                map[ip].count++;

            }
        }
        return next()

    } else {
        map[ip] = {count: 1, windowStart: Date.now()};
        return next();
    }

}

app.get("/api/data", rateLimiter, (req, res) => {
    return res.status(200).json({
        "message": "success",
    })
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
