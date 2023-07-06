
#include <array>
#include <concepts>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <omp.h>
#include <stdexcept>
#include <utility>

#include "permutations.hpp"
#include "teams.hpp"

struct Array {
	uint64_t size;
	uint64_t* data;
};

std::ostream& operator<<(std::ostream& os, const Array& array) {
	for(uint64_t i = 0; i < array.size; ++i) {
		if(i > 0) {
			os << " ";
		}
		os << unsigned(array.data[i]);
	}
	return os;
}

uint64_t factorial(const uint8_t n) {

	if(n <= 1) {
		return 1;
	}
	return factorial(n - 1) * n;
}

// n! options
template <std::size_t T> uint8_t allPermutations() {
	[[maybe_unused]] const uint64_t size = factorial(T);

	uint64_t data[T]; // TODO: is set to 0?

	Tournament tournament = get_current_tournament();

	Team<4> teams = get_current_teams();

#pragma omp parallel
	{

		constexpr uint8_t Z = T;

#pragma omp for
		for(uint8_t i = 0; i < Z; ++i) {

			uint64_t temp[T];

			constexpr uint8_t A = T - 5;

			QuickPerm<A>([&temp](uint8_t a[T]) {

			});

#pragma omp critical
			{
				for(uint8_t j = 0; j < T; ++j) {
					data[j] += temp[j];
				}
				std::cout << "Done loop " << (unsigned)i << "/" << T << "\n";
			}
		}
	}

	return 1;
}

int main(void) {

	//  16! = 20.922.789.888.000

	[[maybe_unused]] uint8_t permutations = allPermutations<16>();
	// std::cout << permutations.first << " - " << permutations.second << "\n";
	return 0;
}
