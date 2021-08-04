module.exports = (values, sorting = (a, b) => (a - b)) => {
  const sorted = values.slice().sort(sorting);
  return (q) => {
    if (sorted.length / q < 1) throw new Error(`Too small set of ${sorted.length} for Q=${q}`);
    return [...Array(q).keys()]
      .map((index) => {
        const rangeStart = (sorted.length * index) / q;
        if (index === q - 1) return sorted.slice(rangeStart);

        const rangeEnd = (sorted.length * (index + 1)) / q;
        return sorted.slice(rangeStart, rangeEnd);
      });
  };
};
