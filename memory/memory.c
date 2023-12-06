#include <emscripten.h>

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
    return "Hello world, wasm!";
}