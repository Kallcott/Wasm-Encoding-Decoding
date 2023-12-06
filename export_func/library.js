function logProgress(propotions) {
  console.log(propotions * 100.0);
  document.getElementById("progress").style.width = `${propotions * 200}px`;
}

function curTime() {
  return new Date();
}

// mergeInto was renmaed to addToLibrary 2023/08/23
// mergeInto still works for backwards compatability

// Only run in WASM compiler
if (typeof addToLibrary !== "undefined") {
  addToLibrary({
    logProgress: logProgress,
    curTime: curTime,
  });
}
