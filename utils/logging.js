const defaultLogging = process.env.DEBUG === '1';
export function createLog(opts = {enable: defaultLogging}) {

  let depth = 0;
  const indent =  () =>' '.repeat(depth * 2);
  const log = (...args) => opts?.enable && console.log(indent(), ...args);

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
        log(...args);
        args.length > 0 && console.log(...args);
      },
      log: log, //console.log.bind(console)
    }
  );
};

export const log = createLog();