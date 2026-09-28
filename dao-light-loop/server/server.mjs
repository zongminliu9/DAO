import { createDaoServer } from './app.mjs';
const PORT = Number(process.env.PORT || 8787);
createDaoServer().listen(PORT, () => console.log(`DAO prototype running at http://localhost:${PORT}`));
