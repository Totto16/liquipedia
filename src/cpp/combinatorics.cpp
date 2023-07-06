
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

template <std::size_t TEAM_AMOUNT>
void increase_advancers(uint64_t (&advance_count)[TEAM_AMOUNT],
                        const std::array<Points, TEAM_AMOUNT>& points) {

	// TODO: also take into account MEA and EU (xD) guaranteed spot!

	std::vector<uint8_t> indices =
	    argSort<uint8_t>(points.cbegin(), points.cend(), std::greater<Points>());

	// top 6 advance
	for(uint8_t i = 0; i < ADVANCE_AMOUNT; ++i) {
		const uint8_t index = indices[i];
		advance_count[index]++;
	}
}

template <std::size_t TEAM_AMOUNT, std::size_t PERMUTATIONS>
void updateStats(const uint8_t current_permutation[PERMUTATIONS],
                 uint64_t (&advance_count)[TEAM_AMOUNT], const uint8_t index,
                 const std::array<Points, TEAM_AMOUNT>& participating_team_points,
                 const Tournament& tournament) {

	std::array<Points, TEAM_AMOUNT> final_points;
	std::copy(std::begin(participating_team_points), std::end(participating_team_points),
	          std::begin(final_points));
	for(uint8_t i = 0; i < PERMUTATIONS + 1; ++i) {
		// 1-16
		const uint8_t a_r = current_permutation[i - 1] - 1;
		// 0-15
		const Place place = i == 0 ? index : (a_r >= index ? a_r + 1 : a_r);

		final_points[i] += tournament.points.at(place);
	}

	increase_advancers<TEAM_AMOUNT>(advance_count, final_points);
}

using TeamResult = std::unordered_map<std::string, long double>;

#ifdef _WIN32
using LoopType = int8_t;
#else
using LoopType = uint8_t;
#endif

// n! options
template <std::size_t TEAM_AMOUNT>
TeamResult allPermutations(const uint8_t alreadyPlayedTournaments,
                           std::optional<std::string> CSVFile) {

	const uint8_t PERMUTATIONS = TEAM_AMOUNT;

	const uint64_t size = factorial(PERMUTATIONS);

	if(alreadyPlayedTournaments == TOURNAMENT_AMOUNT) {
		std::cout << "All tournaments have already been played!\n";
		return TeamResult{};
	}

	if(alreadyPlayedTournaments > TOURNAMENT_AMOUNT) {
		std::cerr << "alreadyPlayedTournaments to high: " << alreadyPlayedTournaments << " > "
		          << TOURNAMENT_AMOUNT << "\n";
		std::exit(3);
	}

	uint64_t team_advance_count[TEAM_AMOUNT] = {};

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

		constexpr LoopType LOOP_AMOUNT = TEAM_AMOUNT;
#pragma omp for
		for(LoopType i = 0; i < LOOP_AMOUNT; ++i) {

			uint64_t local_advance_count[TEAM_AMOUNT] = {};
			constexpr uint8_t REDUCED_PERMUTATIONS = PERMUTATIONS - 1;

			QuickPerm<REDUCED_PERMUTATIONS>([&](uint8_t current_permutation[REDUCED_PERMUTATIONS]) {
				updateStats<TEAM_AMOUNT, REDUCED_PERMUTATIONS>(
				    current_permutation, local_advance_count, static_cast<uint8_t>(i),
				    participating_team_points, tournament);
			});

#pragma omp critical
			{
				for(uint8_t j = 0; j < TEAM_AMOUNT; ++j) {
					team_advance_count[j] += local_advance_count[j];
				}
				std::cout << "Done loop " << static_cast<unsigned>(i + 1) << "/"
				          << static_cast<unsigned>(LOOP_AMOUNT) << "\n";
			}
		}
	}

	TeamResult result{};
	for(uint8_t i = 0; i < TEAM_AMOUNT; ++i) {
		result.insert_or_assign(participating_teams[i].name,
		                        static_cast<long double>(team_advance_count[i]) /
		                            static_cast<long double>(size));
	}

	if(CSVFile.has_value()) {
		std::ofstream csv_result(CSVFile.value(), std::ios::out);
		csv_result << "team name,percentage,absolut amount, total amount\n";

		for(uint8_t i = 0; i < TEAM_AMOUNT; ++i) {
			const Team<TOURNAMENT_AMOUNT>& team = participating_teams[i];
			csv_result << team.name << "," << std::setprecision(32) << std::fixed
			           << result.at(team.name) << "," << team_advance_count[i] << "," << size
			           << "\n";
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

	TeamResult permutations = allPermutations<16>(2, CSVFile);

	long double sum = 0.0L;
	for(auto const& [name, val] : permutations) {
		sum += val;
	}

	// top 6 advance!
	long double abs_error = std::fabs(sum - static_cast<long double>(ADVANCE_AMOUNT));
	if(abs_error >= std::numeric_limits<long double>::epsilon()) {
		std::cerr << "Error: the calculations where wrong: off by " << abs_error << "\n";
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
