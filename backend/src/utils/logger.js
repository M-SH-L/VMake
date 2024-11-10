const logger = {
    info: (...args) => {
      if (process.env.DEBUG) {
        console.log('\n[INFO]', new Date().toISOString());
        console.log(...args);
      }
    },
    error: (...args) => {
      console.error('\n[ERROR]', new Date().toISOString());
      console.error(...args);
    }
  };
  
  export default logger;