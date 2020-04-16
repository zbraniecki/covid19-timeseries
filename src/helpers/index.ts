import {
  Selection,
  Region,
  State,
  DataType,
  DataPoint,
  Regions,
  RegionIds,
  Values,
  TaxonomyLevel,
  View,
} from "@/types";

const numFormat = new Intl.NumberFormat(undefined);
const percFormat = new Intl.NumberFormat(undefined, { style: "percent" });
const percFormat2 = new Intl.NumberFormat(undefined, { style: "percent", minimumFractionDigits: 1 });

export default {
  enums: {
    keys<T>(myEnum: T): (keyof T)[] {
      return Object.keys(myEnum) as any;
    },
    values<T>(myEnum: T): Array<any> {
      return Object.values(myEnum) as any;
    },
    entries<T>(myEnum: T): { id: keyof T; name: string }[] {
      return Object.entries(myEnum).map((entry) => {
        return { id: entry[1], name: entry[0] };
      });
    },
    default<T>(myEnum: T): T {
      return (Object.keys(myEnum)[0] as unknown) as T;
    },
    get<T>(myEnum: T, input: string | null): any | null {
      return null;
    },
    getKey<T>(myEnum: T): string {
      return (myEnum as unknown) as string;
    },
  },
  getTypeValue(values: Values, dataType: DataType): number | null {
    const key: string = this.enums.getKey(dataType);
    const key2: keyof Values = key as keyof Values;
    const val = values[key2];
    if (val === undefined) {
      return null;
    }
    return val;
  },
  getValuesForDateIdx(region: Region, idx: number): DataPoint | null {
    const point = region.dates[idx];
    if (point === undefined) {
      return null;
    } else {
      return point;
    }
  },
  getValue(region: Region, idx: number, selection: Selection): number | null {
    const dataTypes = selection.dataTypes;
    const view = selection.view;

    if (view === View.Delta) {
      const totalSelection = this.getSelectionForView(selection, View.Total);
      const value = this.getValue(region, idx, totalSelection);
      if (value === null) {
        return value;
      }
      const prev = this.getValue(region, idx - 1, totalSelection);
      if (prev === null) {
        return null;
      } else if (prev === value) {
        return 0;
      } else {
        if (prev === 0) {
          return 1;
        }
        return value / prev - 1;
      }
    }

    if (view === View.EMA) {
      const totalSelection = this.getSelectionForView(selection, View.Total);
      let total = this.getValue(region, idx, totalSelection);
      if (total === null) {
        return null;
      }
      const total3EMA = this.calculateEMA(region, idx, 3, totalSelection);
      const total7EMA = this.calculateEMA(region, idx, 7, totalSelection);
      if (total3EMA === null || total7EMA === null) {
        return null;
      }
      return (total3EMA - total7EMA) / total;
    }

    if (dataTypes.length == 2) {
      if (dataTypes[1] == DataType.Population) {
        const mainSelection = this.getSelectionForDataTypes(selection, [
          dataTypes[0],
        ]);
        const mainValue = this.getValue(region, idx, mainSelection);
        return this.divideByPopulation(region, mainValue);
      } else {
        const mainSelection = this.getSelectionForDataTypes(selection, [
          dataTypes[0],
        ]);
        const mainValue = this.getValue(region, idx, mainSelection);
        if (mainValue === null) {
          return null;
        }
        const secondarySelection = this.getSelectionForDataTypes(selection, [
          dataTypes[1],
        ]);
        const secondaryValue = this.getValue(region, idx, secondarySelection);
        if (secondaryValue === null || secondaryValue === 0) {
          return null;
        }
        return mainValue / secondaryValue;
      }
    }

    const dataType = dataTypes[0];
    if (dataType === DataType.Population) {
      return null;
    }

    const dataPoint = this.getValuesForDateIdx(region, idx);
    if (dataPoint) {
      return this.getTypeValue(dataPoint.value, dataTypes[0]);
    }
    return null;
  },
  divideByPopulation(region: Region, value: number | null): number | null {
    if (!region.meta.population || value === null) {
      return null;
    }
    return Math.round(value / (region.meta.population / 1000000));
  },
  getLatestValue(region: Region, selection: Selection): number | null {
    const mainDataType = selection.dataTypes[0];
    const idx = this.getTypeValue(region.latest, mainDataType);
    if (!idx) {
      return null;
    }

    return this.getValue(region, idx, selection);
  },
  formatValue(value: number | null, selection: Selection): string {
    if (value === null) {
      return "";
    }
    const type = this.valueType(selection);
    switch (type) {
      case "percent": {
        return percFormat.format(value);
      }
      case "number": {
        return numFormat.format(value);
      }
      case "percentWithPrecision": {
        return percFormat2.format(value);
      }
    };
  },
  valueType(selection: Selection): "percent" | "percentWithPrecision" | "number" {
    if (selection.view !== View.Total) {
      return "percent";
    }
    if (selection.dataTypes.length == 1 || selection.dataTypes[1] == DataType.Population) {
      return "number";
    }
    return "percentWithPrecision";
  },
  getHighestValue(region: Region, selection: Selection): number | null {
    const mainDataType = selection.dataTypes[0];
    const value = this.getTypeValue(region.highest, mainDataType);

    if (
      selection.dataTypes.length > 1 &&
      selection.dataTypes[1] === "population"
    ) {
      return this.divideByPopulation(region, value);
    }
    return value;
  },
  getSelectionForDataTypes(
    selection: Selection,
    dataTypes: Array<DataType>
  ): Selection {
    return Object.assign({}, selection, { dataTypes });
  },
  getSelectionForView(selection: Selection, view: View): Selection {
    return Object.assign({}, selection, { view });
  },
  sortData(regions: Regions, regionIds: RegionIds, selection: Selection): void {
    const totalSelection = this.getSelectionForView(selection, View.Total);
    regionIds.sort((a: string, b: string) => {
      const regionA = regions[a];
      const regionB = regions[b];
      const valueA = this.getLatestValue(regionA, totalSelection);
      const valueB = this.getLatestValue(regionB, totalSelection);
      if (valueA === null || isNaN(valueA)) {
        return 1;
      }
      if (valueB === null || isNaN(valueB)) {
        return -1;
      }
      return valueB - valueA;
    });
  },
  parseData(regions: Regions): void {
    for (const regionId in regions) {
      const region = regions[regionId];
      for (let idx = 0; idx < region.dates.length; idx++) {
        const date = this.getValuesForDateIdx(region, idx);
        if (date !== null) {
          date.date = this.parseDate((date.date as unknown) as string);
        }
      }
      region.searchTokens = this.generateSearchTokens(region);
    }
  },
  parseDate(input: string): Date {
    let year;
    let month;
    let day;

    let i = 0;
    for (const chunk of input.split("-")) {
      switch (i) {
        case 0:
          year = parseInt(chunk);
          break;
        case 1:
          month = parseInt(chunk);
          break;
        case 2:
          day = parseInt(chunk);
          break;
      }
      i += 1;
    }
    if (year === undefined || month === undefined || day === undefined) {
      throw new Error(`Failed to parse date: ${input}`);
    }
    const date = new Date(year, month - 1, day);
    return date;
  },
  generateSearchTokens(region: Region): string {
    const tokens: Set<string> = new Set();
    this.addSearchTokensForLevel(tokens, region, TaxonomyLevel.Country);
    this.addSearchTokensForLevel(tokens, region, TaxonomyLevel.State);
    this.addSearchTokensForLevel(tokens, region, TaxonomyLevel.County);
    this.addSearchTokensForLevel(tokens, region, TaxonomyLevel.City);

    return Array.from(tokens).join(" ").toLowerCase();
  },
  addSearchTokensForLevel(
    tokens: Set<string>,
    region: Region,
    level: TaxonomyLevel
  ): void {
    const { code, name } = region.meta[level];
    if (code !== undefined) {
      tokens.add(code.toLowerCase());
      if (name !== undefined) {
        for (const token of name.toLowerCase().split(" ")) {
          tokens.add(token);
        }
      }
    }
  },
  nFormatter(num: number | undefined, digits: number) {
    if (num === undefined) {
      return "";
    }
    const si = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: " k" },
      { value: 1e6, symbol: " M" },
      { value: 1e9, symbol: " B" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  },
  getNormalizedIndex(
    state: State,
    region: Region,
    value: number,
    selection: Selection
  ) {
    const result = {
      firstValue: null as null | number,
      relativeZero: null as null | number,
    };
    for (let idx = 0; idx < region.dates.length; idx++) {
      const dtValue = this.getValue(region, idx, selection);
      if (result.firstValue === null && dtValue) {
        result.firstValue = idx;
      }
      if (dtValue !== null && dtValue > value && idx > 0) {
        result.relativeZero = idx - 1;
        break;
      }
    }
    if (result.relativeZero === null) {
      result.relativeZero = region.dates.length - 1;
    }
    return result;
  },
  interpolateColor(
    color1: Array<number>,
    color2: Array<number>,
    factor: number
  ) {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
  },
  isSameDay(date1: Date, date2: Date) {
    return (
      date1.getDate() == date2.getDate() &&
      date1.getMonth() == date2.getMonth() &&
      date1.getFullYear() == date2.getFullYear()
    );
  },
  isToday(someDate: Date) {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return this.isSameDay(today, someDate);
  },
  getCountNDaysSinceTheLast(
    region: Region,
    days: number,
    selection: Selection
  ): number | null {
    const len = region.dates.length;
    let lastValueIdx = null;

    for (let idx = len; idx >= 0; idx--) {
      if (this.getValue(region, idx, selection) !== null) {
        lastValueIdx = idx;
        break;
      }
    }
    if (lastValueIdx === null) {
      return null;
    }

    let vector = lastValueIdx;
    for (let idx = lastValueIdx; idx >= 0 && lastValueIdx - days < idx; idx--) {
      if (this.getValue(region, idx, selection) !== null) {
        vector = idx;
      }
    }

    return this.getValue(region, vector, selection);
  },
  getClosestRoundedNumber(input: number | null): number {
    if (input === null) {
      return 0;
    }
    const str = input.toString();
    const digits = str.length;
    const m = Math.pow(10, digits - 1);
    return Math.floor(input / m) * m;
  },
  calculateEMA(
    region: Region,
    idx: number,
    range: number,
    selection: Selection
  ): number | null {
    let total = this.getValue(region, idx, selection);
    if (total === null || idx < 1) {
      return total;
    }
    let prevTotal = this.calculateEMA(region, idx - 1, range, selection);
    if (!prevTotal) {
      return total;
    }

    var k = 2 / (range + 1);
    return total * k + prevTotal * (1 - k);
  },
  isRegionIncluded(
    region: Region,
    selection: Selection,
    searchQuery: string
  ): boolean {
    if (!selection.taxonomyLevels.includes(region.meta.taxonomy)) {
      return false;
    }
    if (
      searchQuery.length > 0 &&
      region.searchTokens !== undefined &&
      !region.searchTokens.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  },
};
