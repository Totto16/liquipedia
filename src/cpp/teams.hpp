

#pragma once

#include <array>
#include <cstdint>
#include <stdexcept>
#include <string>
#include <unordered_map>

using Place = uint8_t;

using TeamPlace = Place; // | 'DNQ' = 17 || >= 17 invalid => -1

using Points = uint16_t;

using PointsObject = std::unordered_map<Place, Points>;

struct Tournament {
	std::string name;
	PointsObject points;
};

template <std::size_t T> struct Team {
	std::string name;
	std::array<TeamPlace, T> places;
	Points points;
	Place place;
};

Tournament get_current_tournament();

constexpr uint8_t AMOUNT = 27;

constexpr uint8_t TOURNAMENT_AMOUNT = 4;

constexpr uint8_t NORMAL_TEAM_AMOUNT = 16;

constexpr uint8_t ADVANCE_AMOUNT = 6;

std::array<Team<TOURNAMENT_AMOUNT>, AMOUNT> get_current_teams();

std::array<Team<TOURNAMENT_AMOUNT>, NORMAL_TEAM_AMOUNT>
get_participating_teams(uint8_t alreadyPlayedTournaments);
