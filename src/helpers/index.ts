export default {
  nFormatter(num: number | undefined, digits: number) {
    if (num === undefined) {
      return "";
    }
    const si = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: " k" },
      { value: 1e6, symbol: " M" },
      { value: 1e9, symbol: " B" }
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
  parseDate(input: string) {
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
      return undefined;
    }
    const date = new Date(year, month - 1, day);
    return date;
  },
  isSameDay(date1: Date, date2: Date) {
    return date1.getDate() == date2.getDate() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getFullYear() == date2.getFullYear();
  },
  isToday(someDate: Date) {
    const today = new Date()
    today.setDate(today.getDate() - 1);
    return this.isSameDay(today, someDate);
  },
  getValue(
    region: Region,
    idx: number,
    dataTypes: Array<DataType>
  ): number | null {
    let result = null;

    if (
      region.dates.length > idx &&
      region.dates[idx].value.hasOwnProperty(dataTypes[0])
    ) {
      result = region.dates[idx].value[dataTypes[0]];
    }

    return result;
  }
};
