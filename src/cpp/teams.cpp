
#include <teams.hpp>

#include <teams_generated.hpp>

std::array<Team<TOURNAMENT_AMOUNT>, NORMAL_TEAM_AMOUNT>
get_participating_teams(const uint8_t alreadyPlayedTournaments) {
	const auto teams = get_current_teams();

	std::array<Team<TOURNAMENT_AMOUNT>, NORMAL_TEAM_AMOUNT> participating_teams{};
	uint8_t index = 0;
	for(uint8_t i = 0; i < teams.size(); ++i) {
		// 16 is Placement maximum, not NORMAL_TEAM_AMOUNT
		if(teams[i].places[alreadyPlayedTournaments] > 16) {
			continue;
		}
		participating_teams[index] = teams[i];
		++index;
	}

	if(index != NORMAL_TEAM_AMOUNT) {
		throw std::runtime_error(
		    "Error in retrieving the participating_teams: this is likely a parser error!");
	}

	return participating_teams;
}
