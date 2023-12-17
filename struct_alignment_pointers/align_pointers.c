#include <emscripten.h>
#include <stdlib.h>
#include <stdint.h>
// #include <stdio.h>

extern void printNameToConsole(char *str);

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
    int **ptr;
    // cannot use array syntax, because we don't know the size
    int *int_arr;
    int arr_size;
    char *name;
} __attribute__((packed)) s;

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

// EMSCRIPTEN_KEEPALIVE
// int getPtr(s *obj)
// {
//     // De-reference Pointer
//     return *(obj->ptr);
// }

EMSCRIPTEN_KEEPALIVE
int getPtr(s *obj)
{
    // Double De-reference Pointer
    return *(*(obj->ptr));
}

// Adds Sum of array
// Look for a terminator of 0 bytes
// - Fails if any elements have a value of 0
EMSCRIPTEN_KEEPALIVE
int compSumTerminator(s *obj)
{
    int sum = 0;
    int i = 0;
    while (obj->int_arr[i])
    {
        sum += obj->int_arr[i++];
    }
    return sum;
}

// Adds Sum of array
// Uses a stored Array_size property
// - Works even if elements are value 0
EMSCRIPTEN_KEEPALIVE
int compSumSize(s *obj)
{
    int sum = 0;
    for (int i = 0; i < obj->arr_size; i++)
    {
        sum += obj->int_arr[i];
    }
    return sum;
}

EMSCRIPTEN_KEEPALIVE
void printName(s *obj)
{
    printNameToConsole(obj->name);
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