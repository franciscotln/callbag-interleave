const interleave = (...iters) => (start, sink) => {
  if (start !== 0) return;

  let loop;
  let stop;
  const iterator = typeof Symbol === 'function' && Symbol.iterator;
  const n = iters.length;
  const iterators = [];

  for (let j = 0; j < n; j++) {
    iterators.push(iterator && iters[j][iterator] ? iters[j][iterator]() : iters[j]);
  }

  sink(0, t => {
    if (t === 1) {
      while (loop = !loop) {
        if (stop) break;
        const values = [];
        for (let i = 0; i < n; i++) {
          const nextValue = iterators[i].next();
          if (nextValue.done) {
            stop = true;
            values.length = 0;
            sink(2);
            break;
          } else values.push(nextValue.value);
        }
        if (!stop) sink(1, values);
      }
      return;
    }

    if (t === 2) stop = true;
  });
};

export default interleave;
