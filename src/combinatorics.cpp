
#include <array>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <utility>

//   const result : number[][] = [];

//   function allPermutations(temp
//                            : number[], limits
//                            : number[], index
//                            : number)
//       : void {
//     if (index == = temp.length) {
//       // stop condition for the recursion [base clause]
//       result.push(temp);
//       return;
//     }
//     for (let i = 0; i <= limits[index]; ++i) {
//       temp[index] = i;
//       allPermutations(temp, limits,
//                       index + 1); // recursive invokation, for next elements
//     }
//   }

//   const temp : number[] =
//                    new Array(teams.length).fill(undefined).map((_) = > -1);
//   const limits = new Array(teams.length).fill(undefined).map((_) = > 16);
//   allPermutations(temp, limits, 0);

//   console.log(result);

//   return result;
// }

using PermutationType = std::pair<const uint8_t *const, const uint64_t>;

uint64_t recGetNPRSize(const uint8_t n, const uint8_t r) {

  if (r == 0) {
    return 1;
  } else if (r == 1) {
    return n;
  }

  return recGetNPRSize(n - 1, r - 1) * n;
}

uint64_t getNPRSize(const uint8_t n, const uint8_t r) {

  if (r > n) {
    throw std::runtime_error("in nPr r can't be greater than n: " +
                             std::to_string(r) + " >" + std::to_string(n));
  }

  return recGetNPRSize(n, r);
}

// n P r
PermutationType allPermutations(const uint8_t n, const uint8_t r) {
  const uint64_t size = getNPRSize(n, r);
  const uint8_t *data = (uint8_t *)malloc(size);
  if (data == nullptr) {
    throw std::runtime_error("Couldn't allocate " + std::to_string(size) +
                             " Bytes");
  }

  return PermutationType{data, size};
}

int main(void) {

  PermutationType permutations = allPermutations(16, 8);
  std::cout << permutations.first << " - " << permutations.second << "\n";
  return 0;
}
