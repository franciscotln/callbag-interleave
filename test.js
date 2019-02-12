const test = require('tape');
const interleave = require('.');

test('it should emit the interleaved values of the provided iterables', t => {
  const iter1 = 'abc';
  const iter2 = [0, 1, 2];

  let completed;
  const result = [];
  const sink = source => {
    let talkback;
    source(0, (type, data) => {
      if (type === 0) {
        talkback = data;
        t.equal(typeof data, 'function');
      }
      if (type === 1) result.push(data);
      if (type === 1 || type === 0) talkback(1);
      if (type === 2 && data === undefined) completed = true;
    });
  };

  sink(interleave(iter1, iter2));

  t.true(completed);
  t.deepEqual(result, [['a', 0], ['b', 1], ['c', 2]]);
  t.end();
});

test('it should emit the interleaved values as long as the first iterable completes', t => {
  const iter1 = 'a';
  const iter2 = [0, 1, 2];

  let completed;
  const result = [];
  const sink = source => {
    let talkback;
    source(0, (type, data) => {
      if (type === 0) {
        talkback = data;
        t.equal(typeof data, 'function');
      }
      if (type === 1) result.push(data);
      if (type === 1 || type === 0) talkback(1);
      if (type === 2 && data === undefined) completed = true;
    });
  };

  sink(interleave(iter1, iter2));

  t.true(completed);
  t.deepEqual(result, [['a', 0]]);
  t.end();
});

test('it should support async pulls', t => {
  const iter1 = 'abc';
  const iter2 = [0, 1, 2];
  function* iter3() {
    yield 9;
    yield 8;
    yield 7;
  }

  let completed;
  const result = [];
  const sink = source => {
    let talkback;
    source(0, (type, data) => {
      if (type === 0) {
        talkback = data;
        t.equal(typeof data, 'function');
      }
      if (type === 1) result.push(data);
      if (type === 1 || type === 0) setTimeout(() => talkback(1), 100);
      if (type === 2 && data === undefined) completed = true;
    });
  };

  sink(interleave(iter1, iter2, iter3()));

  setTimeout(() => {
    t.true(completed);
    t.deepEqual(result, [['a', 0, 9], ['b', 1, 8], ['c', 2, 7]]);
    t.end();
  }, 450);
});

test('it should stop emitting if the sink sends a sygnal "2"', t => {
  const iter1 = 'abc';
  const iter2 = [0, 1, 2];

  let completed;
  const result = [];
  const sink = source => {
    let talkback;
    source(0, (type, data) => {
      if (type === 0) {
        talkback = data;
        t.equal(typeof data, 'function');
      }
      if (type === 1) {
        result.push(data);
        if (data[0] === 'b') talkback(2);
      }
      if (type === 1 || type === 0) talkback(1);
      if (type === 2 && data === undefined) completed = true;
    });
  };

  sink(interleave(iter1, iter2));

  t.false(completed);
  t.deepEqual(result, [['a', 0], ['b', 1]]);
  t.end();
});
