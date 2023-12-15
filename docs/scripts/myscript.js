// add your JavaScript/D3 to this file
let rowConverter = function(d) {
  return {
    Earn: +d.Earn,
    Health: d.Health,
  }
}

function adjustRow(svg, item, toggle) {
  d3.select('#range').attr('value', item)

  svg.selectAll('#axis').remove()
  svg.selectAll('line').remove()
  svg.selectAll('rect').remove()
  svg.selectAll('circle').remove()

  let arr = ["Poor", "Fair", "Good", "Very good", "Excellent"]
  let x = d3.scaleLinear().domain([0, item]).range([0, 420])

  svg.append('g')
  .attr("transform", "translate(0," + 340 + ")")
  .attr('id', 'axis')
  .call(d3.axisBottom(x))

  let y = d3.scaleBand()
  .domain(arr)
  .range([340, 0])

  svg.append('g')
  .attr('id', 'axis')
  .text('Health')
  .call(d3.axisLeft(y))

  d3.csv('https://raw.githubusercontent.com/dtung8068/cps-asec-2023/main/df.csv', rowConverter).then(function(data) {
    let groups = d3.groups(data, d => d.Health)
    for(let i = 0; i < groups.length; i++) {
      let values = groups[i][1].map(d => d.Earn / 1000000)

      if(toggle == true) {
        values = values.filter(d => d < 0.2)
      }

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

      let outliers = values.filter(d => d > max)

      svg.selectAll(groups[i][0] + '_outlier').data(outliers).enter()
      .append('circle')
      .attr('r', 2)
      .attr('cx', function(d) { return x(d)})
      .attr('cy', y(groups[i][0]))
      .attr('id', groups[i][0] + '_outlier')
      .attr('transform', 'translate(0, 34)')
    }
  });
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
.attr('onchange', "adjustRow(svg, this.value, d3.select(\'#check\').attr(\'checked\'))")

let checkboxes = d3.select('#plot').append('div')

checkboxes.append('input')
.attr('type', 'checkbox')
.attr('id', 'check')
.attr('onclick', 'adjustRow(svg, d3.select(\'#range\').attr(\'value\'), this.checked)')

checkboxes.append('text').text('Remove Outliers')

adjustRow(svg, 2)



