// With Promises
wasmWorker("/calculator.wasm").then((wasmProxyInstance) => {
  wasmProxyInstance
    .add(2, 3)
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.error("Something went wrong...", error);
    });

  wasmProxyInstance
    .divide(100, 10)
    .then((result) => {
      console.log(result); // 10
    })
    .catch((error) => {
      console.error(error);
    });
});

// // With async/await
// const wasmProxyModule = await wasmWorker();
// const result = await wasmProxyModule.add(2, 3);
// console.log(result);
