// Extern function
function printName(ptr) {
  const str = decodeString(ptr);
  console.log("found name", str, "at", ptr);
}

// Decodes a string
function decodeString(ptr) {
  // get the memory
  var bytes = new Uint8Array(memory.buffer, ptr);

  // find our str len
  var strlen = 0;
  while (bytes[strlen] != 0) {
    strlen++;
  }
  console.log(strlen);

  // decode the value
  return new TextDecoder("utf8").decode(
    bytes
      // we are already offset by pointer, so use 0
      .slice(0, strlen)
  );
}

if (typeof addToLibrary !== "undefined") {
  addToLibrary({
    printNameToConsole: printName,
  });
}
