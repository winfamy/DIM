import { chainComparator, Comparator, compareBy } from 'app/utils/comparators';
import _ from 'lodash';
import { ArmorSet, statHashToType, statKeys, StatTypes } from '../types';
import { statTier } from '../utils';

function getComparatorsForMatchedSetSorting(statOrder: number[], enabledStats: Set<StatTypes>) {
  const comparators: Comparator<ArmorSet>[] = [];

  comparators.push(compareBy((s: ArmorSet) => -sumEnabledStats(s.stats, enabledStats)));

  for (const statHash of statOrder) {
    if (enabledStats.has(statHashToType[statHash])) {
      comparators.push(compareBy((s: ArmorSet) => -statTier(s.stats[statHashToType[statHash]])));
    }
  }

  return comparators;
}

export function sortGeneratedSets(
  statOrder: number[],
  enabledStats: Set<StatTypes>,
  sets?: readonly ArmorSet[]
) {
  if (!sets) {
    return;
  }

  return Array.from(sets).sort(
    chainComparator(...getComparatorsForMatchedSetSorting(statOrder, enabledStats))
  );
}

/**
 * The "Tier" of a set takes into account that each stat only ticks over to a new effective value
 * every 10.
 */
export function calculateTotalTier(stats: ArmorSet['stats']) {
  return _.sum(Object.values(stats).map(statTier));
}

export function sumEnabledStats(stats: ArmorSet['stats'], enabledStats: Set<StatTypes>) {
  return _.sumBy(statKeys, (statType) =>
    enabledStats.has(statType) ? statTier(stats[statType]) : 0
  );
}
