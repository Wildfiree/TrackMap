const colorpel = {
    'source': '#2980b9', 'target': '#f39c12', "stroke":"#2c3e50",
                    "line": '#f1c40f', "backg": "#ecf0f1"}

let width = 900, height = 550;
let s_data, t_data;
let china, china_topo, line, n_line;

let projection = d3.geoMercator();
let geoGenerator = d3.geoPath();

const ref_s = d => projection([d.long_s, d.lat_s])
const ref_t = d => projection([d.long_t, d.lat_t])

const trans = d3.transition().duration(1000)

async function load() {
    [china, china_topo, line] = await Promise.all([
        d3.json('./data/china.json'),
        d3.json('./data/china_topo.json'),
        d3.json("./data/line.json")
    ]);
    console.log(line)
    chart(china, line)
}

const newdata = (data, pro, t) => {
    console.log(data)
    if (t == 0){ n_line = data.filter(d => d.source == pro)} 
    else{ n_line = data.filter(d => d.target == pro)}
    return n_line;
}

const getcol = (d, data) => {
    let pro_name = d.properties.name;
    let pro_col;
    data.forEach(i => {
        if (pro_name === i.s_pro) { pro_col = colorpel.source }
        else if (pro_name === i.t_pro) { pro_col = colorpel.target }
        else { pro_col = colorpel.backg }
    });
    console.log(pro_col)
    return pro_col
}

const chart = (china, line) => {
    projection.fitSize([width, height], china);
    geoGenerator.projection(projection);

    let svg = d3.select("#trackmap")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let g_china = svg.append("g").attr("class", "china"),
        g_hpro = svg.append("g").attr("class", "hpro"),
        g_line = svg.append("g").attr("class", "line");
    
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
    let lines = g_line.selectAll("line").data(line);
        lines.enter().append("line").attr("class", 'hlines')
            .attr("x1", d => ref_s(d)[0])
            .attr("y1", d => ref_s(d)[1])
            .attr("x2", d => ref_t(d)[0])
            .attr("y2", d => ref_t(d)[1])
            .attr("stroke-width", d => d.str_w)
            .attr("stroke", colorpel.line)
            .style("opacity", 0.5)

    d3.selectAll('line')
        .on("mouseover", mouseon_l)
        .on('mouseout', mouseout_l)

    return svg.node();
}

const light = (pro, t) =>{
    n_line = newdata(line, pro, t)

    d3.selectAll(".hpro")
        .data(china.features)
        .attr("d", geoGenerator)
        .attr("fill", d => getcol(d, n_line));
        
    let v = d =>  {
    xs = ref_s(d)[0]
    xt = ref_t(d)[0]
    ys = ref_s(d)[1]
    yt = ref_t(d)[1]
    d3.line().curve(d3.curveBasis)

    }

    d3.selectAll('.hlines')
        .data(n_line)
        .attr("x1", d => ref_s(d)[0])
        .attr("y1", d => ref_s(d)[1])
        .attr("x2", d => ref_t(d)[0])
        .attr("y2", d => ref_t(d)[1])
        .attr("stroke-width", d => d.str_w)
        .attr("stroke", colorpel.line)
        
}

const mouse = () => {
    d3.selectAll('.hlines')
        .on("mouseover", () => {console.log('test')})
        .on('mouseout', mouseout_l)

    // d3.selectAll('.pro')
    //     .on("mouseover", mouseon_p(d))
    //     .on('mouseout', mouseout_p(d))

}

const mouseon_l = (d) => {
    console.log('test')
    let aline = d3.select(this)
            .transition()
            .duration(100)
            // .style("opacity", 1)
            .style("stroke-width", 5)

    // console.log(aline)
    let spro = d.s_pro,
        tpro = d.t_pro;
    console.log(spro, tpro)

    d3.selectAll(".hpro")
        .data(china.features)
        .attr("d", geoGenerator)
        .transition(trans)

        .attr("fill", d => colorline(d, spro, tpro));

}
const colorline = (d, spro, tpro) =>{
    let pro_name = d.properties.name;
    let pro_col;
    if (pro_name === spro) { pro_col = colorpel.source }
    else if (pro_name === tpro) { pro_col = colorpel.target }
    else { pro_col = colorpel.backg }
    console.log(pro_col)
    return pro_col

}

const mouseout_l = (d) => {
    let aline = d3.select(this)
            .transition()
            .duration(100)
            .style("opacity", 0.5)
    // console.log(aline)
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


