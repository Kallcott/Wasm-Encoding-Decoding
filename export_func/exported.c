#include <emscripten.h>
#include <stdlib.h>

// Get Current Time
extern unsigned int curTime();

// Updates the Dom's Progress bar
extern void logProgress(double progress);

EMSCRIPTEN_KEEPALIVE
unsigned char *randomString(int len)
{
    // allocate to string
    unsigned char *str = malloc(len + 1);

    // seed random value
    srand(curTime());
    const int min_utf = 33;
    const int max_uft = 127;

    for (int i = 0; i < len; i++)
    {
        // gen random char between 33 and 126 UTF8 encoding (printable characters: !-/ -> 0-9, A-z, {-~ )
        str[i] = rand() % (max_uft - min_utf) + min_utf;

        // Log Progress
        logProgress((double)(i + 1) / (double)len);

        // Simulate a heavy compute
        for (int j = 0; j < 100000000; j++)
        {
        }
    }

    str[len] = 0;
    return str;
}
