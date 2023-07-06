
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

template <std::size_t T, std::size_t A>
void updateStats(const uint8_t a[A], uint64_t (&result)[T], const uint8_t(&index),
                 const std::array<Points, T>& participating_team_points,
                 const Tournament& tournament) {

	std::array<Points, T> final_points = participating_team_points;
	for(uint8_t i = 0; i < A + 1; ++i) {
		// 1-16
		const uint8_t a_r = a[i - 1] - 1;
		const Place place = i == 0 ? index : (a_r >= index ? a_r + 1 : a_r);

		final_points[i] += tournament.points.at(place);
	}

	// TODO:
	//	std::pair<Point, uint8_t>
	(void)result;

	// [advancements]
}

using TeamResult = std::unordered_map<std::string, double>;

// n! options
template <std::size_t T> TeamResult allPermutations(uint8_t alreadyPlayedTournaments) {
	constexpr uint8_t P = 4;
	const uint64_t size = factorial(T - P);

	uint64_t data[T] = {};

	const Tournament tournament = get_current_tournament();

	const std::array<Team<4>, AMOUNT> teams = get_current_teams();

	const std::array<Team<4>, T> participating_teams =
	    get_participating_teams(alreadyPlayedTournaments);

	std::array<Points, T> participating_team_points{};
	for(uint8_t i = 0; i < T; ++i) {
		participating_team_points[i] = participating_teams[i].points;
	}

#pragma omp parallel
	{
		constexpr uint8_t Z = T - P;

#pragma omp for
		for(uint8_t i = 0; i < Z; ++i) {

			uint64_t temp[T] = {};
			constexpr uint8_t A = Z - 1;

			QuickPerm<A>([&](uint8_t a[A]) {
				updateStats<T, A>(a, temp, i, participating_team_points, tournament);
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

	TeamResult result{};
	for(uint8_t i = 0; i < T; ++i) {
		result.insert_or_assign(participating_teams[i].name,
		                        (long double)data[i] / (long double)size);
	}

	return result;
}

int main(void) {

	//  16! = 20.922.789.888.000

	// QuickPerm<6>([&](uint8_t a[6]) { display<6>(a); });
	TeamResult permutations = allPermutations<16>(2);

	std::cout << "\n";
	for(auto const& [name, val] : permutations) {
		std::cout << name << " has gone to PGC " << (val * 100) << " % of ALL "
		          << "possible results"
		             "\n";
	}
	std::cout << "\n";
	for(auto const& [name, val] : permutations) {
		printf("%s, %0.12lf\n", name.c_str(), val);
	}

	return 0;
}
