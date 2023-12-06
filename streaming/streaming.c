#include <emscripten.h>

int add(int a, int b);
int sub(int a, int b);
int mul(int a, int b);
int div_(int a, int b);

EMSCRIPTEN_KEEPALIVE
int sumOfNInts(int n)
{
    // return n * (n + 1) / 2;
    return div_(mul(n, add(n, 1)), 2);
}
