// add your JavaScript/D3 to this file
let rowConverter = function(d) {
  return {
    Earn: +d.Earn,
    Health: d.Health,
  }
}

function adjustRow(svg, item) {
  svg.selectAll('#axis').remove()
  svg.selectAll('line').remove()
  svg.selectAll('rect').remove()
  let arr = ["Poor", "Fair", "Good", "Very good", "Excellent"]

  let x = d3.scaleLinear()
  .domain([0, item])
  .range([0, 420])

  let dummy = d3.scaleLinear()
  .domain([0, 2])
  .range([0, 420])

  let y = d3.scaleBand()
  .domain(arr)
  .range([340, 0])

  d3.csv('df.csv', rowConverter).then(function(data) {
    let groups = d3.groups(data, d => d.Health)
    for(let i = 0; i < groups.length; i++) {

      let values = groups[i][1].map(d => d.Earn / 1000000)
      let q1 = d3.quantile(values, 0.25)
      let median = d3.quantile(values, 0.5)
      let q3 = d3.quantile(values, 0.75)
      let iqr = q3 - q1
      let min = q1 - 1.5 * iqr
      let max = q3 + 1.5 * iqr

      //Min/Max
      svg.append('line')
      .style('width', 50)
      .attr('stroke', 'black')
      .attr('x1', d3.max([x(min), 0]))
      .attr('x2', x(max))
      .attr('y1', y(groups[i][0]))
      .attr('y2', y(groups[i][0]))
      .attr('transform', 'translate(0, 34)')

      //Box
      svg.append('rect')
      .attr('height', 25)
      .attr('width', x(q3) - x(q1))
      .attr('fill', 'green')
      .attr('stroke', 'black')
      .attr('x', x(q1))
      .attr('y', y(groups[i][0]))
      .attr('transform', 'translate(0, 20)')

      //Median
      svg.append('line')
      .attr('stroke', 'black')
      .attr('x1', x(median))
      .attr('x2', x(median))
      .attr('y1', y(groups[i][0]))
      .attr('y2', y(groups[i][0]) + 25)
      .attr('transform', 'translate(0, 20)')

    }
  });
  svg.append('g')
  .attr("transform", "translate(0," + 340 + ")")
  .attr('id', 'axis')
  .call(d3.axisBottom(x))

  svg.append('g')
  .attr('id', 'axis')
  .text('Health')
  .call(d3.axisLeft(y))

}


let svg = d3.select('#plot').append('svg')
.attr('width', 500)
.attr('height', 400)
.append('g')
.attr('transform', 'translate(60, 30)')

svg.append('text')
.attr('x', 250)
.attr('text-anchor', 'middle')
.style('font-size', '12px')
.text('Distribution of Earnings for Employed People by Health Status')

svg.append('text')
.attr('x', 250)
.attr('y', 368)
.attr('text-anchor', 'middle')
.style('font-size', '12px')
.text('Earnings (in millions)')

svg.append('text')
.attr('x', -180)
.attr('y', -40)
.attr('text-anchor', 'middle')
.attr('transform', 'rotate(-90)')
.style('font-size', '12px')
.text('Health')

let slider = d3.select('#plot').append('input')
.attr('type', 'range')
.attr('min', 0)
.attr('max', 2)
.attr('value', 2)
.attr('id', 'range')
.attr('step', 0.1)
.attr('onchange', "adjustRow(svg, this.value)")

adjustRow(svg, 2)



