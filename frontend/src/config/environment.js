let IS_PROD = false;
export const server = IS_PROD ? "https://meetflow-aosr.onrender.com" : "http://localhost:8000";

export default { server };