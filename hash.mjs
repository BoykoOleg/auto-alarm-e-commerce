import { createHash } from 'crypto';

const hash = createHash('sha256').update('DivisionAuto').digest('hex');
console.log(hash);
