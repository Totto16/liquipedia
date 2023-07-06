

#pragma once

#include <array>
#include <cstdint>
#include <string>
#include <unordered_map>

using Place = uint8_t;

using TeamPlace = Place; // | 'DNQ' = 17

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

Team<4> get_current_teams();
