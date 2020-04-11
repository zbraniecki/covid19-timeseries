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
  regions: Array<string>;
  dataTypes: Array<DataType>;
  normalizationValue: number | null;
  view: View | null;
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
  data: Array<Region>;
}

/* Inputs */

export interface SelectionInput {
  presentation: Presentation | null;
  regions: Array<string>;
  dataTypes: Array<DataType>;
  normalizationValue: number | null;
  view: View | null;
}
