const defaultLogging = process.env.DEBUG === '1';
export function createLog(opts = {enable: defaultLogging}) {

  let depth = 0;
  const indent =  () =>' '.repeat(depth * 2);
  const log = (...args) => {
    if (!opts?.enable) return;
    
    // NOTE: when depth > 0 and multiple lines are writen, only the first line will be intented
    process.stdout.write(indent());
    console.log(...args);
  };

  return Object.assign(log, 
    {
      reset() {
        depth = 0;
      },
      push(...args) {
        // console.group(...args);
        log(...args);
        depth++;
      },
      pop(...args) {
        depth --;
        // console.groupEnd();
        // args.length > 0 && console.log(...args);
        args.length > 0 && log(...args);        
      },
      log, //console.log.bind(console)
    }
  );
};

export const log = createLog();