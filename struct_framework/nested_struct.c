#include <emscripten.h>
#include <stdlib.h>
#include <stdint.h>
// #include <stdio.h>

// Use pointer to tell wasm how to decode it
typedef struct
{
    uint64_t l;
    char ch;
    // Compiler was adding extra padding between s and sub_s bytes
} __attribute__((packed)) sub_s;

typedef struct
{
    int a;
    int b;
    float c;
    sub_s structure;
} s;

EMSCRIPTEN_KEEPALIVE
s *createStruct(int a, int b, float c, uint64_t l, char ch)
{
    s *newstruct = malloc(sizeof(s));
    newstruct->a = a;
    newstruct->b = b;
    newstruct->c = c;
    newstruct->structure.l = l;
    newstruct->structure.ch = ch;

    return newstruct;
    ;
}

EMSCRIPTEN_KEEPALIVE
float computeSum(s *obj)
{
    return (float)(obj->a + obj->b) + obj->c;
}

EMSCRIPTEN_KEEPALIVE
uint64_t getBigInt(s *obj)
{
    return obj->structure.l;
}

EMSCRIPTEN_KEEPALIVE
char getChar(s *obj)
{
    return obj->structure.ch;
}

EMSCRIPTEN_KEEPALIVE
void *wasmmalloc(int size)
{
    return malloc(size);
}

EMSCRIPTEN_KEEPALIVE
void wasmfree(void *ptr)
{
    free(ptr);
}