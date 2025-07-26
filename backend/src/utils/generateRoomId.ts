import { randomUUID, createHash } from 'crypto';

function generateRoomId(): string {
    const uuid = randomUUID(); // RFC4122-compliant random UUID
    const timestamp = Date.now().toString();
    const data = uuid + timestamp;
    return createHash('sha256').update(data).digest('hex');
}

export default generateRoomId;
