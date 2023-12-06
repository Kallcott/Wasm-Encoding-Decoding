#include <emscripten.h>
#include <stdlib.h>

// Use pointer to tell wasm how to decode it
typedef struct
{
    int a;
    int b;
    float c;
} pair;

EMSCRIPTEN_KEEPALIVE
float computeSum(pair *p)
{
    return (float)(p->a + p->b) + p->c;
};

EMSCRIPTEN_KEEPALIVE
pair *createPair(int a, int b, float c)
{
    pair *p = malloc(sizeof(pair));
    p->a = a;
    p->b = b;
    p->c = c;
    return p;
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
