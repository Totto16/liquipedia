
#include <argparse/argparse.hpp>
#include <array>
#include <cmath>
#include <concepts>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <functional>
#include <iomanip>
#include <iostream>
#include <omp.h>
#include <optional>
#include <stdexcept>
#include <utility>

#include "helper.hpp"
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

template <std::size_t T>
void increase_advancers(uint64_t (&result)[T], const std::array<Points, T>& points) {

	// TODO: also take into account MEA and EU (xD) guaranteed spot!

	std::vector<uint8_t> indices =
	    argSort<uint8_t>(points.cbegin(), points.cend(), std::greater<Points>());

	// top 6 advance
	for(uint8_t i = 0; i < 6; ++i) {
		const uint8_t index = indices[i];
		++result[index];
	}
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

	increase_advancers<T>(result, final_points);
}

using TeamResult = std::unordered_map<std::string, long double>;

#ifdef _WIN32
using LoopType = int8_t;
#else
using LoopType = uint8_t;
#endif

// n! options
template <std::size_t TEAM_AMOUNT, std::size_t PERMUTATIONS = TEAM_AMOUNT>
TeamResult allPermutations(const uint8_t alreadyPlayedTournaments,
                           std::optional<std::string> CSVFile) {
	constexpr uint8_t P = PERMUTATIONS;
	const uint64_t size = factorial(TEAM_AMOUNT - P);

	uint64_t data[TEAM_AMOUNT] = {};

	const Tournament tournament = get_current_tournament();

	const std::array<Team<TOURNAMENT_AMOUNT>, AMOUNT> teams = get_current_teams();

	const std::array<Team<TOURNAMENT_AMOUNT>, TEAM_AMOUNT> participating_teams =
	    get_participating_teams(alreadyPlayedTournaments);

	std::array<Points, TEAM_AMOUNT> participating_team_points{};
	for(uint8_t i = 0; i < TEAM_AMOUNT; ++i) {
		participating_team_points[i] = participating_teams[i].points;
	}

#pragma omp parallel
	{
		constexpr uint8_t LOOP_AMOUNT = TEAM_AMOUNT - P;

#pragma omp for
		for(LoopType i = 0; i < LOOP_AMOUNT; ++i) {

			uint64_t temp[TEAM_AMOUNT] = {};
			constexpr uint8_t A = LOOP_AMOUNT - 1;

			QuickPerm<A>([&](uint8_t a[A]) {
				updateStats<TEAM_AMOUNT, A>(a, temp, static_cast<uint8_t>(i),
				                            participating_team_points, tournament);
			});

#pragma omp critical
			{
				for(uint8_t j = 0; j < TEAM_AMOUNT; ++j) {
					data[j] += temp[j];
				}
				std::cout << "Done loop " << static_cast<unsigned>(i + 1) << "/"
				          << static_cast<unsigned>(LOOP_AMOUNT) << "\n";
			}
		}
	}

	TeamResult result{};
	for(uint8_t i = 0; i < TEAM_AMOUNT; ++i) {
		result.insert_or_assign(participating_teams[i].name,
		                        static_cast<long double>(data[i]) / static_cast<long double>(size));
	}

	if(CSVFile.has_value()) {
		std::ofstream csv_result(CSVFile.value(), std::ios::out);
		csv_result << "team name,percentage,absolut amount, total amount\n";

		for(uint8_t i = 0; i < TEAM_AMOUNT; ++i) {
			const Team<TOURNAMENT_AMOUNT>& team = participating_teams[i];
			csv_result << team.name << "," << std::setprecision(23) << std::fixed
			           << result.at(team.name) << "," << data[i] << "," << size << "\n";
		}
		csv_result.close();
	}

	return result;
}

int main(int argc, char const* argv[]) {

	std::optional<std::string> CSVFile = std::nullopt;

	argparse::ArgumentParser parser{ "combinatorics", PROGRAMM_VERSION,
		                             argparse::default_arguments::all };

	parser.add_argument("-c", "--csvfile")
	    .help("the path of a csv file used for storing the results");
	try {
		parser.parse_args(argc, argv);

		if(auto path = parser.present("--csvfile")) {

			CSVFile = path.value();
		}

	} catch(const std::exception& err) {
		std::cerr << "error parsing command line arguments: " << err.what() << "\n";
		std::exit(1);
	}

	TeamResult permutations = allPermutations<16, 7>(2, CSVFile);

	long double sum = 0.0;
	for(auto const& [name, val] : permutations) {
		sum += val;
	}

	// top 6 advance!
	long double abs_error = std::fabs(sum - static_cast<long double>(6.0));
	if(abs_error >= 0.000000001) {
		std::cerr << "Error: the calculations where wrong: off by" << abs_error << "\n";
		std::exit(1);
	}

	std::cout << "\n";
	for(auto const& [name, val] : permutations) {
		std::cout << name << " has gone to PGC " << (val * 100) << " % of ALL "
		          << "possible results"
		             "\n";
	}

	return 0;
}
