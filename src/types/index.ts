export enum Presentation {
  Table = "table",
  Chart = "chart"
}

export enum DataType {
  Cases = "cases",
  Deaths = "deaths",
  Active = "active",
  Recovered = "recovered",
  Tested = "tested",
  Hospitalized = "hospitalized",
  Population = "population"
}

export enum View {
  Total = "total",
  Delta = "delta",
  EMA = "ema"
}

export enum TaxonomyLevel {
  Country = "country",
  State = "state",
  County = "county",
  City = "city"
}

export interface Selection {
  presentation: Presentation | null;
  regions: RegionIds;
  dataTypes: Array<DataType>;
  normalizationValue: number | null;
  view: View | null;
  taxonomyLevels: Array<TaxonomyLevel>;
}

export interface Values {
  cases: number;
  deaths: number;
  active?: number;
  recovered?: number;
  tested?: number;
}

export interface DataPoint {
  date: Date;
  value: Values;
}

export interface Region {
  id: string;
  dates: Array<DataPoint>;
  latest: Values;
  highest: Values;
  meta: {
    country: {
      code?: string;
      name?: string;
    };
    state: {
      code?: string;
      name?: string;
    };
    county: {
      code?: string;
      name?: string;
    };
    city: {
      code?: string;
      name?: string;
    };
    population?: number;
    taxonomy: TaxonomyLevel;
  };
  displayName: string;
  searchTokens?: string;
}

export interface State {
  controls: {
    views: Array<Presentation>;
  };
  selection: Selection;
  sortedRegionIds: RegionIds;
  loadedTaxonomies: Set<TaxonomyLevel>;
}

export type Regions = { [key: string]: Region; };
export type RegionList = Array<Region>;
export type RegionIds = Array<string>;

/* Inputs */

export interface SelectionInput {
  presentation: Presentation | null;
  regions: RegionIds;
  dataTypes: Array<DataType>;
  normalizationValue: number | null;
  view: View | null;
}
