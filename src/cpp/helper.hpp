

#pragma once

#include <numeric>
#include <vector>

// from https://stackoverflow.com/questions/1577475/c-sorting-and-keeping-track-of-indexes
template <class TYPE, class RAIter, class Compare>
std::vector<TYPE> argSort(RAIter first, RAIter last, Compare comp) {

	std::vector<TYPE> idx(static_cast<std::vector<TYPE>::size_type>(last - first));
	std::iota(idx.begin(), idx.end(), static_cast<TYPE>(0));

	auto idxComp = [&first, comp](TYPE i1, TYPE i2) { return comp(first[i1], first[i2]); };

	sort(idx.begin(), idx.end(), idxComp);

	return idx;
}
