import {createClient} from "redis"

type Bucket = {
    token: number;
    lastRefillTime: number;
}


const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
}

const redisClient = createClient({
    url: redisUrl,
});

redisClient.on("error", (err) => {
    console.log("Error connecting to redis");
})


async function connectRedis() {
    await redisClient.connect();
    console.log("Redis Connected");
}

function getBucket(ip: string) {
    const cachedKey = `rate_limit_${ip}`;
    return redisClient.hGetAll(cachedKey)
}

async function setBucket(ip: string, bucket: Bucket) {
    const cachedKey = `rate_limit_${ip}`;
    await redisClient.hSet(cachedKey, bucket)
}

export {connectRedis, getBucket, setBucket};