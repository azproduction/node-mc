export default {
    PORT: process.env.PORT || 8080,
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_CLIENT: typeof window !== 'undefined'
};
