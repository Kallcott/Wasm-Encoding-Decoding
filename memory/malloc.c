#include <emscripten.h>
#include <stdlib.h>

EMSCRIPTEN_KEEPALIVE
int accumulate(
    // a pointer
    int *arr,
    int n)
{
    int sum = 0;
    // Start from end of array, stop when it hits 0
    while (n)
    {
        sum += arr[--n];
    }
    return sum;
}

EMSCRIPTEN_KEEPALIVE
const char *getString()
{
    return "Hello world, wasm with Decode!";
}

EMSCRIPTEN_KEEPALIVE
void *wasmmalloc(size_t n)
{
    return malloc(n);
}

EMSCRIPTEN_KEEPALIVE
void wasmfree(void *ptr)
{
    free(ptr);
}
