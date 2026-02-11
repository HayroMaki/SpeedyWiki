import { createClient } from 'redis';
import { readEnvFile } from './functions/readEnvFile.js';

const env = readEnvFile();

const client = createClient({
    username: env['REDIS_USERNAME'],
    password: env['REDIS_PASSWORD'],
    socket: {
        host: env['REDIS_HOST'],
        port: env['REDIS_PORT']
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function testConnection() {
    console.log("Connecting to Redis...");
    await client.connect();
    console.log("Connected!");

    await client.set('test-key', 'Hello Redis from SpeedyWiki');
    const value = await client.get('test-key');
    console.log("Retrieved value:", value);

    await client.disconnect();
}

testConnection();
