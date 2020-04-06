export default {
  nFormatter(num, digits) {
    if (!num) {
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
  }
};