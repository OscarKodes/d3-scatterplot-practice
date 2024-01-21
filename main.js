/* CONSTANTS AND GLOBALS */
const height = window.innerHeight * 0.8;
const margin = {
  top: 50,
  left: 50,
  right: 200,
  bottom: 50,
};
let width = window.innerWidth * 0.8;

// Limiting the width,
// so the plot isn't stretched too much if have wide screen
width = width > height ? height + margin.right : width;

/* LOAD DATA */
d3.csv("data.csv", d3.autoType).then((data) => {
  console.log(data);

  // Plan for scatterplot:
  //   title = guildName
  //     x = avgLvl
  //     y = goldPerMonth
  //     size = membersCount
  //     color = mainClass

  /* SCALES ##################################################### */
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((d) => d.avgLvl))])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.goldPerMonth)])
    .range([height - margin.top, margin.bottom]);

  // // Placing genres and colors in variables to be reused in colorScale & Legend
  let allClasses = new Set(data.map((d) => d.mainClass));
  allClasses = [...allClasses];

  const colorScale = d3
    .scaleOrdinal()
    .domain(allClasses)
    .range(d3.schemeCategory10);
  const sizeScale = d3
    .scaleSqrt()
    .domain([1, d3.max(data, (d) => d.membersCount)])
    .range([3, 16]);

  /* HTML ELEMENTS ############################################## */
  // SVG CANVAS -----------------------------------------------
  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "lavender");
  // AXIS TICKS  ----------------------------------------------
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.top})`)
    .call(d3.axisBottom(xScale));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  // AXIS LABELS ----------------------------------------------
  svg
    .append("text")
    .attr("text-achor", "end")
    .attr("x", width / 3)
    .attr("y", height - margin.bottom / 4)
    .style("font-weight", "bold")
    .style("font-size", "1.2rem")
    .text("Average Guild Level");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width * -0.35)
    .attr("y", 18)
    .attr("font-weight", "bold")
    .attr("font-size", "1.2rem")
    .attr("transform", "rotate(-90)")
    .text("Gold per Month");

  // DOTS FOR SCATTERPLOT ----------------------------------
  const dot = svg
    .selectAll(".dot") // Line below sorts films by largest budget to smallest, so small dots appear on top
    .data(data)
    .join("circle")
    .attr("class", "dot")
    .attr(
      "transform",
      (d) => `translate(${xScale(d.avgLvl)},${yScale(d.goldPerMonth)})`
    )
    .attr("r", (d) => sizeScale(d.membersCount))
    .attr("fill", (d) => colorScale(d.mainClass))
    .attr("stroke", "black");

  //   .join(
  //     enter => enter
  //       .append("circle")
  //         .attr("class", "dot")
  //         .attr("transform", `translate(${margin.left}, ${height - margin.top})`)
  //         .attr("r", d => sizeScale(d["Budget (million $)"]))
  //         .attr("fill", d => colorScale(d.Genre))
  //         .attr("stroke", "black")
  //         .attr("opacity", "0.4")
  //         .on("mouseover", tipMouseover)
  //         .on("mouseout", tipMouseout)
  //       .call(enter => enter
  //         .transition()
  //           .duration(1500)
  //           .delay((d, i) => yScale(d["Audience Ratings %"]) + i * 2)
  //           .attr("transform", d => `translate(${xScale(d["Rotten Tomatoes Ratings %"])}, ${yScale(d["Audience Ratings %"])})`)
  //       )
  //   );

  // TOOLTIPS ----------------------------------------------------

  dot.attr("data-tippy-allowHTML", true);

  dot.attr("data-tippy-content", (d) => {
    return `
    <p>Guild Name: ${d.guildName}</p>
    <p>Main Class: ${d.mainClass}</p>
    <p>Average Level: ${d.avgLvl}</p>
    <p>Gold Per Month: ${d.goldPerMonth}</p>
    <p>Member Count: ${d.membersCount}</p>
    `;
  });

  tippy(dot.nodes());

  // tippy(".dot", {
  //   content: "<strong>Bolded content</strong>",
  //   allowHTML: true,
  // });

  //   // LEGENDS ------------------------------------------------
  //   // Title for Legend
  svg
    .append("text")
    .text("Main Classes:")
    .attr("x", width - margin.right * 0.65)
    .attr("y", height * 0.3 - margin.top)
    .style("font-size", "1rem")
    .style("font-weight", "bold");

  //   // Color dots for Legend
  svg
    .selectAll(".legend-dot")
    .data(d3.schemeCategory10.slice(0, allClasses.length))
    .join("circle")
    .attr("class", "legend-dot")
    .attr("cx", width - margin.right * 0.62)
    .attr("cy", (_, i) => height * 0.33 - margin.top + 22 * i)
    .attr("r", 6)
    .attr("fill", (d) => d)
    .attr("stroke", "black")
    .attr("opacity", 0.7);

  //   // Class labels for Legend
  svg
    .selectAll(".legend-class")
    .data(allClasses)
    .join("text")
    .attr("class", "legend-class")
    .attr("x", width - margin.right * 0.55)
    .attr("y", (_, i) => height * 0.332 - margin.top + 22 * i)
    .text((d) => d)
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  //   // Grabbing the min, median, and max of budgets
  const allMemberCounts = data.map((d) => d.membersCount);
  const threeMemberCounts = [
    d3.min(allMemberCounts),
    d3.median(allMemberCounts),
    d3.max(allMemberCounts),
  ];

  //   // Title for Budget Legend
  svg
    .append("text")
    .text("Member Count:")
    .attr("x", width - margin.right * 0.65)
    .attr("y", height * 0.6 - margin.top)
    .style("font-weight", "bold")
    .style("font-size", "1rem");

  //   // Circle Sizes for Budget Legend
  svg
    .selectAll(".members-size")
    .data(threeMemberCounts)
    .join("circle")
    .attr("class", "members-size")
    .attr("cx", (d) => width - margin.right * 0.65 + sizeScale(d) / 2)
    .attr("cy", (d, _) => height * 0.63 - margin.top * 1.6 + sizeScale(d) * 7)
    .attr("r", (d) => sizeScale(d))
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("opacity", 0.7);

  //   // Member Count for Legend
  svg
    .selectAll(".legend-memberCount")
    .data(threeMemberCounts)
    .join("text")
    .attr("class", "legend-memberCount")
    .attr("x", width - margin.right * 0.5)
    .attr("y", (d) => height * 0.625 - margin.top * 1.5 + sizeScale(d) * 7)
    .text((d) => d + " members")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  // FILM TITLE LABELS ON HOVERED DOTS -----------------------
  // NOTE: Not used. Decided to replace with tooltips.
  // const text = svg
  //   .selectAll("text")
  //   .data(data)
  //   .enter()
  //   .append("text")
  //   .attr("x", d => xScale(d["Rotten Tomatoes Ratings %"]))
  //   .attr("y", d => yScale(d["Audience Ratings %"]))
  //   .text(d => d.Film)
  //   .style("opacity", 0)
  //   .on("mouseover", function(d) {
  //     d3.select(this)
  //       .transition()
  //       .duration("100")
  //       .style("opacity", 1)
  //   })
  //   .on("mouseout", function(d) {
  //     d3.select(this)
  //       .transition()
  //       .duration("200")
  //       .style("opacity", 0)
  //   });
});
