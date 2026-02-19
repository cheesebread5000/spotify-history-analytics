chartRadial = {
  const width = 1080; 
  const height = width;
  const cx = width * 0.5; 
  const cy = height * 0.48; 
  const radius = Math.min(width, height) / 2 - 280; 

  const tree = d3.cluster()
      .size([2 * Math.PI, radius])
      .separation((a, b) => {
        let sep = (a.parent == b.parent ? 1 : 2) / a.depth;
        
        const isTitleA = a.parent && a.parent.data.name === "Title Fight";
        const isTitleB = b.parent && b.parent.data.name === "Title Fight";

        if (isTitleA && isTitleB) return sep * 5; 
        if (isTitleA || isTitleB) return sep * 3; 

        return sep;
      });

  const root = tree(d3.hierarchy(hierarchyData)
      .sort((a, b) => d3.ascending(a.data.name, b.data.name)));

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-cx, -cy, width, height])
      .attr("style", "width: 100%; height: auto; font: 12px sans-serif; background-color: white;");

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .join("path")
      .attr("d", d3.linkRadial()
          .angle(d => d.x)
          .radius(d => d.y));

  svg.append("g")
    .selectAll("circle")
    .data(root.descendants())
    .join("circle")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .attr("fill", d => d.children ? "#333" : "#69b3a2") 
      .attr("r", d => d.children ? 4 : 3);

  svg.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
    .selectAll("text")
    .data(root.descendants())
    .join("text")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0) rotate(${d.x >= Math.PI ? 180 : 0})`)
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("paint-order", "stroke")
      .attr("stroke", "white")
      .attr("fill", d => d.depth === 0 ? "none" : "#333") 
      .attr("font-weight", d => d.children ? "bold" : "normal") 
      .text(d => d.data.name);

  svg.append("text")
     .attr("x", -width/2 + 40)
     .attr("y", -height/2 + 80) 
     .attr("font-size", "32px")
     .attr("font-weight", "bold")
     .attr("fill", "#222")
     .text("Top Artists & Songs (2019–2025)");

  return svg.node();
}