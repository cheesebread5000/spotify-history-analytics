chartHeatmap = {
  // 1. UPDATED: Increased width to 1150 to prevent right-side cutoff
  const targetWidth = 1150; 
  
  const cellSize = 17;
  const margin = { top: 40, right: 20, bottom: 20, left: 55 };
  const colGap = 50;
  const headerHeight = 100;
  const legendWidth = 100;

  const singleChartWidth = (cellSize * 24) + margin.left + margin.right;
  const heightPerYear = (cellSize * 7) + margin.top + margin.bottom;

  const leftYears = [2019, 2020, 2021];
  const rightYears = [2022, 2023, 2024, 2025];
  const allYears = [...leftYears, ...rightYears];

  const rightColHeight = heightPerYear * rightYears.length;
  const leftColHeight = heightPerYear * leftYears.length;
  const verticalOffset = (rightColHeight - leftColHeight) / 2;

  const totalHeight = headerHeight + rightColHeight + 20;

  const filteredData = data.filter(d => allYears.includes(d.date.getFullYear()));

  const rollup = d3.rollup(
    filteredData,
    v => v.length,
    d => d.date.getFullYear(),
    d => `${d.date.getDay()}-${d.date.getHours()}`
  );

  const msPerYear = d3.rollup(
    filteredData,
    v => d3.sum(v, d => d.ms_played),
    d => d.date.getFullYear()
  );

  const maxCount = d3.max(Array.from(rollup.values()).flatMap(m => Array.from(m.values()))) || 1;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = d3.range(0, 24);
  const color = d3.scaleSequential(d3.interpolateGnBu).domain([0, maxCount]);

  const svg = d3.create("svg")
    .attr("width", targetWidth)
    .attr("height", totalHeight)
    .attr("viewBox", [0, 0, targetWidth, totalHeight])
    .attr("style", "max-width: 100%; height: auto; font-family: sans-serif; background-color: white;");

  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
      .attr("id", "heat-gradient")
      .attr("x1", "0%").attr("y1", "100%")
      .attr("x2", "0%").attr("y2", "0%");

  d3.range(0, 1.1, 0.1).forEach(t => {
      gradient.append("stop")
          .attr("offset", `${t * 100}%`)
          .attr("stop-color", d3.interpolateGnBu(t));
  });

  svg.append("text")
    .attr("x", 40)
    .attr("y", 60)
    .attr("font-size", "48px")
    .attr("font-weight", "bold")
    .attr("fill", "#222")
    .text("Spotify Listening Time (2019–2025)");

  function drawYear(year, xOffset, yOffset) {
    const g = svg.append("g").attr("transform", `translate(${xOffset}, ${yOffset})`);

    const totalMs = msPerYear.get(year) || 0;
    const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
    const d = Math.floor(totalHours / 24);
    const h = totalHours % 24;
    const durationText = `${d}d ${h}h`;

    g.append("text")
      .attr("x", margin.left)
      .attr("y", margin.top - 15)
      .attr("font-weight", "bold")
      .attr("font-size", "20px")
      .attr("fill", "#333")
      .text(`${year} • ${durationText} listened`);

    const yearData = rollup.get(year) || new Map();

    days.forEach((dayName, dayIndex) => {
      g.append("text")
        .attr("x", margin.left - 10)
        .attr("y", margin.top + (dayIndex * cellSize) + (cellSize * 0.75))
        .attr("text-anchor", "end")
        .attr("font-size", "13px")
        .attr("font-weight", "500")
        .attr("fill", "#777")
        .text(dayName);

      hours.forEach((hour) => {
        const value = yearData.get(`${dayIndex}-${hour}`) || 0;

        g.append("rect")
          .attr("x", margin.left + (hour * cellSize))
          .attr("y", margin.top + (dayIndex * cellSize))
          .attr("width", cellSize - 1)
          .attr("height", cellSize - 1)
          .attr("fill", value === 0 ? "#f6f6f6" : color(value))
          .attr("rx", 3)
          .append("title")
          .text(`${dayName} @ ${hour}:00\nCount: ${value}`);
      });
    });

    const hourLabels = [0, 6, 12, 18];
    g.append("g")
      .selectAll("text")
      .data(hourLabels)
      .join("text")
      .attr("x", h => margin.left + (h * cellSize) + (cellSize / 2))
      .attr("y", margin.top + (7 * cellSize) + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#999")
      .text(h => `${h}:00`);
  }

  leftYears.forEach((year, i) => {
    const xPos = 0;
    const yPos = headerHeight + verticalOffset + (i * heightPerYear);
    drawYear(year, xPos, yPos);
  });

  rightYears.forEach((year, i) => {
    const xPos = singleChartWidth + colGap;
    const yPos = headerHeight + (i * heightPerYear);
    drawYear(year, xPos, yPos);
  });

  // 2. UPDATED: Moved legend slightly closer (+20 instead of +30)
  const legX = (singleChartWidth * 2) + colGap + 20;
  
  const legY = headerHeight + (rightColHeight * 0.25); 
  const legHeight = rightColHeight * 0.5; 
  const legBarWidth = 16;

  const legendG = svg.append("g").attr("transform", `translate(${legX}, ${legY})`);

  legendG.append("rect")
      .attr("width", legBarWidth)
      .attr("height", legHeight)
      .style("fill", "url(#heat-gradient)")
      .style("stroke", "#ddd");

  const legendScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([legHeight, 0]);

  const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format("d"));

  legendG.append("g")
      .attr("transform", `translate(${legBarWidth}, 0)`)
      .call(legendAxis)
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .attr("font-size", "14px");

  legendG.append("text")
      .attr("transform", `rotate(90)`)
      .attr("x", legHeight / 2)
      .attr("y", -legBarWidth - 45) 
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#555")
      .text("Streams / Hour");

  return svg.node();
}