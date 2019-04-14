const colorpel = {
    'source': '#d48d92', 'target': '#5c8aad', "stroke":"#2c3e50",
    "line": '#a8c2d8', "hline": "#aa7073","backg": "#ecf0f1"}

let width = 850, height = 500;
let s_data, t_data;
let china, china_topo, line, n_line;
let s_info, t_info;

let projection = d3.geoMercator();
let geoGenerator = d3.geoPath();

const ref_s = d => projection([d.long_s, d.lat_s])
const ref_t = d => projection([d.long_t, d.lat_t])
const pin = d =>{
    let x1 = ref_s(d)[0],
        y1 = ref_s(d)[1],
        x2 = ref_t(d)[0],
        y2 = ref_t(d)[1];
    return p = [x1, y1, x2, y2]
} 

const trans = d3.transition().duration(2000)
// const lineg = d3.line().x(d =>).y().curve()
let arrow = 'm0,0L-20,-10,-13,0,-20,10,0,0'
const trangleg = (l, x, y) => {
    
}
let trangle = 'M0 0 L20 0 L0 20  Z'

async function load() {
    [china, china_topo, line] = await Promise.all([
        d3.json('./data/china.json'),
        d3.json('./data/china_topo.json'),
        d3.json("./data/line.json")
    ]);
    projection.fitSize([width, height], china);
    geoGenerator.projection(projection);

    // console.log(line)
    chart(china, line)
}

const chart = (china, line) => {
    projection.fitSize([width, height], china);
    geoGenerator.projection(projection);

    let svg = d3.select("#trackmap")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let g_china = svg.append("g").attr("class", "china"),
        g_hpro = svg.append("g").attr("class", "hpros"),
        g_line = svg.append("g").attr("class", "line"),
        text = svg.append("g").attr('id', '#text'),
        g_circle = svg.append("g").attr("class", "circles")

    let lid = 7;
    let defaultd = line.filter(d => d.id == lid);
    infoset(defaultd[0]);

    // china map background
    let map = g_china.selectAll("path")
                .data(china.features);
                
        map
            .enter()
            .append("path").attr("class", "pro")
            .attr("d", geoGenerator)
            .attr("fill", d => colorline(d, defaultd[0].s_pro, defaultd[0].t_pro));
    
    // heighlight province
    let pro = g_hpro.selectAll("path").data(china.features)
        pro.enter().append("path").attr("class", 'hpro')

    let lpath = d => `M${pin(d)[0]}, ${pin(d)[1]} A400,400 0 0,0 ${ref_t(d)[0]},${ref_t(d)[1]}`
    
    let lines = g_line.selectAll("path").data(line);
        lines.enter().append("path").attr("class", 'hlines')
            .attr('d', d => lpath(d))
            .attr('fill', "none")
            .attr("stroke-width", d => d.id === lid ? 3.5 : 2.5)
            .attr('stroke', d => d.id === lid ? colorpel.hline : colorpel.line)
            .style("opacity", d => d.id === lid ? 1 : 0.4)

    let circles = g_circle.selectAll(".circle").data(line);
        circles.enter().append('circle').attr("class", 'circle')
            .attr("cx", d => pin(d)[2])
            .attr("cy", d => pin(d)[3])
            .attr('d', trangle)
            .attr('r', 2)
            .attr("fill", colorpel.target)
            .style('opacity', 0.6)

    d3.selectAll('.hlines')
        .on("mouseover", mouseon_l)
        // .on('mouseout', mouseout_l)

    return svg.node();
}


const mouseon_l = (d) => {
    let lid = d.id
    d3.selectAll('.hlines')
        .transition(trans)
        .attr("stroke-width", d => d.id == lid ? 3.5 : 2.5)
        .attr('stroke', d => d.id == lid ? colorpel.hline : colorpel.line)
        .style("opacity", d => d.id == lid ? 1 : 0.5)
    
    // console.log(aline)
    let spro = d.s_pro,
        tpro = d.t_pro;

    d3.selectAll(".hpro")
        .data(china.features)
        .attr("d", geoGenerator)
        .transition(trans)
        .attr("fill", d => colorline(d, spro, tpro));

    d3.selectAll(".arc").remove()

    d3.select('.hpros')
        .append('circle').attr('class', 'arc')
        .attr('cx', pin(d)[0])
        .attr('cy', pin(d)[1])
        .attr('r', 5)

    d3.select('.hpros')
        .append('circle').attr('class', 'arc')
        .attr('cx', pin(d)[2])
        .attr('cy', pin(d)[3])
        .attr('r', 5)
    infoset(d);
}

const colorline = (d, spro, tpro) => {
    let pro_name = d.properties.name;
    let pro_col;
    if (pro_name === spro) { pro_col = colorpel.source }
    else if (pro_name === tpro) { pro_col = colorpel.target }
    else { pro_col = colorpel.backg }
    return pro_col
}

const infoset = d => {
    pren = d3.select('#money span').text()
    // console.log(pren, d.money)
    // console.log(d)
    if (d.money === 'nan') {$('#money').text()}
    else { 
        d3.select('#money span')
            .transition(trans)
            .text(d.money)
            .tween('d', function(){
                const i = d3.interpolateNumber(pren, d.money);
                return t => { d3.select(this).text(i(t) | 0);}
                
            })
    }
    $('#source span').text(d.source)
    $('#target span').text(d.target)
}

const newline = d => {

}
load()