// Bytes sizes of primitive types
let types = {
  char: 1,
  short: 2,
  int: 4,
  float: 4,
  double: 8,
  long: 8,
  // Expand for custom structures
};

// We need to distinguide between primitive types, and nested types
let primitives = ["char", "short", "int", "float", "double", "long"];

// Store our structs as they are loaded
let structs = {};

/**
 * Registers our list of structs, and records it's type
 * @param {string} name string
 * @param {*} structFormat our structure object
 */
function registerStruct(name, structFormat) {
  types[name] = computeStructureSize(structFormat);
  structs[name] = structFormat;
}

/**
 * Gets the size of the element
 * @param {string} type a registered Type
 * @returns number size
 */
function getElemSize(type) {
  if (type.endsWith("*") || type.endsWith("[]")) {
    return 4;
  } else {
    return types[type];
  }
}

/**
 * computes the size of all the types in our struct format.
 * @param {*} structFormat
 * @returns int, byte size of struct
 */
function computeStructureSize(structFormat) {
  let size = 0;

  for (const type of Object.values(structFormat)) {
    // Special case for pointer
    size += getElemSize(type);
  }

  return size;
}

//#region Encode

// /**
//  * Encodes the number into binary, and assigns it into the buffer
//  * @param {*} num value
//  * @param {*} n bytes size
//  * @param {*} buffer
//  * @param {*} offset
//  */
// function encodePrimitive(num, n, type, buffer, offset = 0) {
//   // First 8 bits are written first in small endian
//   if (type === "int") {
//     for (var i = 0; i < n; i++) {
//       // Assign 8 bits.
//       // Note the UInt8 array will chop off larger values
//       buffer[i + offset] = num;
//       // shift by size of array
//       num >>= 8;
//     }
//   } else if (type === "long") {
//     for (let i = 0; i < n; i++) {
//       buffer[i + offset] = Number(num);
//       num >>= 8n;
//     }
//   } else if (type === "float") {
//     // Get value as IEEE 754, small endian
//     const float32Array = new Float32Array([num]);
//     // Convert to bytes
//     const bytes = new Uint8Array(float32Array.buffer);

//     // Assign bytes to our buffer
//     for (var i = 0; i < n; i++) {
//       buffer[i + offset] = bytes[i];
//       num >>= 8;
//     }
//   } else if (type === "char") {
//     const charcode = String(num).charCodeAt(0);
//     buffer[offset] = charcode;
//   }
// }

function encodeInt(num, n, buffer, offset = 0) {
  for (let i = 0; i < n; i++) {
    buffer[i + offset] = num;
    num >>= 8;
  }
}

// Encode as Int, but using BigInt
function encodeLong(num, n, buffer, offset = 0) {
  for (let i = 0; i < n; i++) {
    buffer[i + offset] = Number(num);
    num >>= 8n;
  }
}

function encodeFloat(obj, memory, pointer, cursor) {
  const floatBuf = new Float32Array(memory.buffer, pointer + cursor);
  floatBuf[0] = obj ?? 0;
}

function encodeChar(obj, memory, pointer, cursor) {
  // const charcode = String(obj).charCodeAt(0);
  const uint8Buf = new Uint8Array(memory.buffer, pointer + cursor);
  uint8Buf[0] = String(obj).charCodeAt(0);
}

// assume buffer has already been allocated.
function encodeStruct(type, obj, buffer, memory, malloc, cursor = 0, pointer = 0) {
  for (const [name, elemType] of Object.entries(structs[type])) {
    encodeElem(elemType, obj[name], buffer, memory, malloc, cursor, pointer);

    cursor += getElemSize(elemType);
  }
}

/**
 * Encode anything
 * @param {} type
 * @param {*} obj
 * @param {*} buffer
 * @param {*} cursor
 */
function encodeElem(type, obj, buffer, memory, malloc, cursor = 0, pointer = 0) {
  console.log("encoding", obj, type, "at", pointer, "offset by", cursor);
  if (type.endsWith("*")) {
    // Chop 1 off to remove "*"
    const ptr = encodePointer(type.substring(0, type.length - 1), obj, memory, malloc);
    console.log("setting", ptr, "at", cursor);
    // Our pointer is stored as an int
    encodeInt(ptr, 4, buffer, cursor);
  } else if (type.endsWith("[]")) {
    // Chop 2 off to remove "[]"
    const ptr = encodeArray(type.substring(0, type.length - 2), obj, memory, malloc);
    console.log("setting", ptr, "at", cursor);
    encodeInt(ptr, 4, buffer, cursor);
  } else if (primitives.includes(type)) {
    switch (type) {
      case "int":
        encodeInt(obj ?? 0, types[type], buffer, cursor);
        break;
      case "long":
        encodeLong(obj ?? 0, types[type], buffer, cursor);
        break;
      case "float":
        encodeFloat(obj, memory, pointer, cursor);
        break;
      case "char":
        encodeChar(obj, memory, pointer, cursor);
        break;
    }
  } else {
    // Recusive
    encodeStruct(type, obj, buffer, memory, malloc, cursor, pointer);
  }
}

/**
 * Loads the pointer range into a buffer, then sends to wasm
 * @param {*} type
 * @param {*} obj
 * @param {*} memory
 * @param {*} malloc
 * @returns
 */
function encodePointer(type, obj, memory, malloc) {
  if (!obj) {
    return 0; // NULL
  }
  // Create pointer
  const n = getElemSize(type);
  const ptr = malloc(n);
  const buf = new Uint8Array(memory.buffer, ptr, n);
  console.log("allocated", n, "at", ptr, "for", type);

  encodeElem(type, obj, buf, memory, malloc, 0, ptr);
  return ptr;
}

/**
 * Encodes an Array.
 * - Includes a terminator element. Will be 0, or array length
 * @param {*} type
 * @param {*} obj
 * @param {*} memory
 * @param {*} malloc
 * @returns
 */
function encodeArray(type, obj, memory, malloc) {
  if (!obj) {
    return 0; // NULL
  }

  // Only worrying about int array right now
  // - so we are assuming data size is constant
  // Add + 1 Terminating array with a padding of 0, or a Array Length
  const n = type === getElemSize(type);
  const nTotal = (obj.length + 1) * n;
  const ptr = malloc(nTotal);
  const buf = new Uint8Array(memory.buffer, ptr, nTotal);

  if (type === "char") {
    // Special Case for Strings

    for (i = 0; i < obj.length; i++) {
      // Asign Object to buffer
      buf[i] = obj[i];
    }
    // add empt
    buf[obj.length] = 0;
  } else {
    // Int

    let cursor = 0;
    for (var i = 0; i < obj.length; i++) {
      // Int
      encodeElem(type, obj[i], buf, memory, malloc, cursor, ptr);
      cursor += n;
    }
    // Encoding Terminator Element of 0
    encodeInt(0, n, buf, cursor);
  }

  return ptr;
}

//#endregion Encode

//#region Decode

/**
 * Breaks buffer into byte chunks according to field's bytes, and convert binary to a value of field type
 * @param {*} n byte size
 * @param {*} type type
 * @param {*} buffer
 * @param {*} offset
 * @returns value of the type
 */
function decodePrimitive(n, type, buffer, offset = 0) {
  let ret = 0;

  //small endian
  if (type === "int") {
    for (var i = n - 1; i >= 0; i--) {
      ret <<= 8;
      ret |= buffer[i + offset];
    }
  } else if (type === "long") {
    ret = BigInt(ret);
    for (var i = n - 1; i >= 0; i--) {
      ret <<= 8n;
      ret |= BigInt(buffer[i + offset]);
    }
  } else if (type === "float") {
    // Get bytes from buffer
    let bytes = new Uint8Array(n);
    for (var i = n - 1; i >= 0; i--) {
      bytes[i] = buffer[i + offset];
    }
    // Interpret as a Float
    let float32Array = new Float32Array(bytes.buffer);
    ret = float32Array[0];
  } else if (type === "char") {
    let firstByte = buffer[offset];
    ret = String.fromCharCode(firstByte);
  }

  return ret;
}

/**
 * Controls cursor as each field is iterated over
 * @param {*} structName
 * @param {*} buffer
 * @returns
 */
function decodeStruct(structName, buffer, offset = 0) {
  var ret = {};
  // start cursor at offset for recursion
  let cursor = offset;
  for (const [key, type] of Object.entries(structs[structName])) {
    // console.log("decoding", buffer.subarray(cursor, cursor + types[type]), "for", key, "as", type, "at", cursor);
    if (primitives.includes(type)) {
      ret[key] = decodePrimitive(types[type], type, buffer, cursor);
    } else {
      // Recursively Decode. now requires offset
      ret[key] = decodeStruct(type, buffer, cursor);
    }

    cursor += types[type];
  }
  return ret;
}

/**
 * Decodes a pointer into a struct object
 * @param {*} structName
 * @param {*} ptr
 * @param {*} memory
 * @returns
 */
function startDecodeStruct(structName, ptr, memory) {
  return decodeStruct(structName, new Uint8Array(memory.buffer, ptr, types[structName]));
}

//#endregion Decode
