#pragma once

#include <cstdint>
#include <functional>

// NOTICE:  Copyright 1991-2010, Phillip Paul Fuchs
// https://www.quickperm.org/01example.php
template <std::size_t N> void QuickPerm(std::function<void(uint8_t[N])> callback) {
	uint8_t a[N], p[N + 1];
	uint8_t i, j, tmp; // Upper Index i; Lower Index j

	for(i = 0; i < N; i++) // initialize arrays; a[N] can be any type
	{
		a[i] = i + 1; // a[i] value is not revealed and can be arbitrary
		p[i] = i;
	}
	p[N] = N;    // p[N] > 0 controls iteration and the index boundary for i
	callback(a); // remove comment to display array a[]
	i = 1;       // setup first swap points to be 1 and 0 respectively (i & j)
	while(i < N) {
		p[i]--;           // decrease index "weight" for i by one
		j = i % 2 * p[i]; // IF i is odd then j = p[i] otherwise j = 0
		tmp = a[j];       // swap(a[j], a[i])
		a[j] = a[i];
		a[i] = tmp;
		callback(a); // remove comment to display target array a[]
		i = 1;       // reset index i to 1 (assumed)
		while(!p[i]) // while (p[i] == 0)
		{
			p[i] = i; // reset p[i] zero value
			i++;      // set new index value for i (increase by one)
		}             // while(!p[i])
	}                 // while(i < N)
} // QuickPerm()

template <std::size_t N> void display(uint8_t a[N]) {
	for(unsigned int x = 0; x < N; x++) {
		printf("%d ", a[x]);
	}
	printf("\n");
}
