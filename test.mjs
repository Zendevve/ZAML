import electron from 'electron';
console.log('Default export type:', typeof electron);
import { app } from 'electron';
console.log('Named export app:', typeof app);
