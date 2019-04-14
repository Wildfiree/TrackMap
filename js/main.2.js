const colorpel = {
    'source': '#2980b9', 'target': '#f39c12', "stroke":"#2c3e50",
                    "line": '#f1c40f', "backg": "#ecf0f1"}

let width = 850, height = 500;
let s_data, t_data;
let china, china_topo, line, n_line;

let projection = d3.geoMercator();
let geoGenerator = d3.geoPath();

const ref_s = d => projection([d.long_s, d.lat_s])
const ref_t = d => projection([d.long_t, d.lat_t])

const trans = d3.transition().duration(1000)
// const lineg = d3.line().x(d =>).y().curve()

async function load() {
    [china, china_topo, line] = await Promise.all([
        d3.json('./data/china.json'),
        d3.json('./data/china_topo.json'),
        d3.json("./data/line.json")
    ]);
    console.log(line)
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
        text = svg.append("g").attr('id', '#text');

    
    // china map background
    let map = g_china.selectAll("path")
                .data(china.features);
                
        map
            .enter()
            .append("path").attr("class", "pro")
            .attr("d", geoGenerator)
            .attr("fill", colorpel.backg);
    
    // heighlight province
    let pro = g_hpro.selectAll("path").data(china.features)
        pro.enter().append("path").attr("class", 'hpro')

    
    // connect lines 
    // let [x1, y1, x2, y2] = [ref_s(d)[0], ref_s(d)[1], ref_t(d)[0], ref_t(d)[0]]
    // path = `M${ref_s(d)[0]},${ref_s(d)[1]}A800,800 0 0,1${ref_t(d)[0]},${ref_t(d)[0]}`
    // let lineg = d3.line()
    let lines = g_line.selectAll("line").data(line);
        lines.enter().append("line").attr("class", 'hlines')
            .attr("x1", d => ref_s(d)[0])
            .attr("y1", d => ref_s(d)[1])
            .attr("x2", d => ref_t(d)[0])
            .attr("y2", d => ref_t(d)[1])
            .attr("stroke-width", d => d.str_w)
            .attr("stroke", colorpel.line)
            .style("opacity", 0.5)
    const linege = d => {
        let x1 = ref_s(d)[0],
            y1 = ref_s(d)[1],
            x2 = ref_t(d)[0],
            y2 = ref_t(d)[1],
            rx = (x1 + x2) / 2,
            ry = (y1 + y2) / 2;

        let x0 = x2 - x1, 
            y0 = y2 - y1, 
            x3 = x1 + x2, 
            y3 = y1 + y2,
            h = 50
            d = x0 / y0, 
            d1 = Math.pow(d, 2),
            d2 = Math.pow(1/d, 2)
            d3 = Math.sqrt(d1 + 1)
            d4 = Math.sqrt(d2 + 1)

        let x = x3 / 2 + h / d3,
            y = y3 / 2 + h / d4
        let path = `M${x1} ${y1} Q${x1} ${y2} ${x} ${y}`
        // let a = [{ "x": x1, "y": y1 }, { "x": x2, "y": y2 }]
    // console.log(a)
        return path;
    }

    let lines2 = g_line.selectAll("path").data(line);
        lines2.enter().append("path").attr("class", 'hlines2')
            .attr('d', d => `M${ref_s(d)[0]}, ${ref_s(d)[1]} A400,400 0 0,0 ${ref_t(d)[0]},${ref_t(d)[1]}`)
            // .attr('d', d => linege(d))
            .attr('fill', "none")
            .attr("stroke-width", 2)
            .attr('stroke', colorpel.line)

    let spro = '辽宁',
        tpro = '贵州';

    


    d3.selectAll('line')
        .on("mouseover", mouseon_l)
        .on('mouseout', mouseout_l)

    return svg.node();
}

const mouseon_l = (d) => {
    let aline = d3.select(this)
            .transition()
            .duration(100)
            // .style("opacity", 1)
            // .style("stroke-width", 5)

    // console.log(aline)
    let spro = d.s_pro,
        tpro = d.t_pro;

    d3.selectAll(".hpro")
        .data(china.features)
        .attr("d", geoGenerator)
        .transition(trans)
        .attr("fill", d => colorline(d, spro, tpro));
    console.log(d)
    console.log(ref_s(d)[0])

    // let t = [d]
    // console.log(t)
    labeltext(d);
    // let text = d3.select('.line')
    //     .select('g').data([d])
    //     .enter().append('g').attr('class', 'tlines')
    // // text
    // // console.log(text.node)

    // text.append('text')
    //     // .data(line)
    //     .attr("x", () => { console.log('t'); return ref_s(d)[0] })
    //     .attr("y", d => ref_s(d)[1])
    //     .text(d.source)
}


const mouseout_l = () => {
    let aline = d3.select(this)
            .transition()
            .duration(100)
            // .style("opacity", 0.5)
    // console.log(aline)
    let spro = '辽宁',
        tpro = '贵州';

    d3.selectAll(".hpro")
        .data(china.features)
        .attr("d", geoGenerator)
        .transition(trans)
        .attr("fill", d => colorline(d, spro, tpro));

}
const defalt = () => {
    let spro = '辽宁',
        tpro = '贵州';

    d3.selectAll(".hpro")
        .data(china.features)
        .attr("d", geoGenerator)
        .transition(trans)
        .attr("fill", d => colorline(d, spro, tpro));

}
// a = '北京'
// b = 0 
// $("input").on("change", () => { a = $("input").val(); light(a,b)})
load()
// mouse()

const colorline = (d, spro, tpro) => {
    let pro_name = d.properties.name;
    let pro_col;
    if (pro_name === spro) { pro_col = colorpel.source }
    else if (pro_name === tpro) { pro_col = colorpel.target }
    else { pro_col = colorpel.backg }
    // console.log(pro_col)
    return pro_col
}

const labeltext = (d) => {
    // projection.fitSize([width, height], china);

    let text = d3.select('#text')

    // let linetext = text.select('g').data([d])
    //             .enter().append('g').attr('class', 'tlines')
    // // text
    console.log(text)

    d3.select('#text').append('text')
        .data([d])
        .attr("x", ref_s(d)[0])
        .attr("y", ref_s(d)[1])
        .text(d.source)
    d3.select('#text').append('text')
        .attr("x", ref_t(d)[0])
        .attr("y", ref_t(d)[1])
        .text(d.target)
}

const con_p = (x1, x2, y1, y2, h) => {
    let x0 = x2 - x1, y0 = y2 - y1, x3 = x1 + x2, y3 = y1 + y2;
    let x = x3 / 2 + h ;


}

const lineg = d => {
    let x1 = ref_s(d)[0], 
        y1 = ref_s(d)[1],
        x2 = ref_t(d)[0],
        y2 = ref_t(d)[1]
    let a = [{"x": x1, "y": y1},{"x": x2, "y": y2}]
    // console.log(a)

    let lineg2  = d3.line()
        .curve(d3.curveNatural)
        .x(d => d.x).y(d => d.y)

    console.log(lineg2(a))
    return lineg2(a)
}