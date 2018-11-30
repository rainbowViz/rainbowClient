import * as React from 'react'
import * as d3 from 'd3'
import * as _ from 'lodash'

interface IProps {
    data: any,
    loadedTime: number,
    onMouseOverCallback: any,
}

interface IState {

}

export default class Partition extends React.Component<IProps, IState> {
    width: number;
    height: number;

    constructor(props: IProps) {
        super(props)
    }

    public componentDidMount() {
        this.width = document.getElementById('partition').clientWidth
        this.height = document.getElementById('partition').clientHeight
        if (this.props.data) {
            this.drawPartition()
        }
    }

    public shouldComponentUpdate(nextProps: IProps, nextState: IState) {
        // If loaded time for input data is different,
        // then one should update this component.
        if (nextProps.loadedTime != this.props.loadedTime) {
            return true
        }

        return false
    }

    public componentDidUpdate() {
        this.clearPartition()
        this.drawPartition()
    }

    public clearPartition() {
        const svg : any = d3.select('#partition-container')
            .select('g')
            .remove();
    }

    public drawPartition() {
        function clicked(that: any, p : any) {
            focus = p;

            root.each((d : any) => d.target = {
                x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
                x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
                y0: d.y0 - p.y0,
                y1: d.y1 - p.y0
            })

            const t = cell.transition().duration(750)
                .attr("transform", (d : any) => `translate(${d.target.y0 + (focus.depth == 0 ? 0 : 50)},${d.target.x0})`);

            rect.transition(t)
                .attr("height", (d : any) => rectHeight(d.target));
            text.transition(t)
                .attr("fill-opacity", (d : any) => +labelVisible(d.target));
            tspan.transition(t)
                .attr("fill-opacity", (d : any) => +labelVisible(d.target) * 0.7);
        }

        function onMouseOver(that: any, p: any) {
            d3.select(this)
                .select('rect')
                .attr("fill-opacity", 0.7)

            that.props.onMouseOverCallback(p)
        }

        function onMouseLeave(p: any) {
            d3.select(this)
                .select('rect')
                .attr("fill-opacity", 0.6)
        }

        function wrap(texts: any, width: number) {
            // TODO: investigate why function() {} and () => {}
            // don't yield the same value for `this`...
            texts.each(function() {
                // console.log(d3.select(this as any))
                let text = d3.select(this as any),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line: any= [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr('y'),
                    x = text.attr('x'),
                    dy = isNaN(parseFloat(text.attr('dy'))) ? 0.2 : parseFloat(text.attr('dy')),
                    tspan = text
                        .text(null)
                            .append('tspan')
                                .attr('x', x)
                                .attr('y', y)
                                .attr('dy', dy + 'em')
                // console.log([y, x, dy])

                while (word = words.pop()) {
                    line.push(word)
                    tspan.text(line.join(' '))
                    var node: any = tspan.node()
                    var hasGreaterWidth = node.getComputedTextLength() > width
                    if (hasGreaterWidth) {
                        line.pop()
                        tspan.text(line.join(' '))
                        line = [word]
                        tspan = text
                            .append('tspan')
                            .attr('x', x)
                            .attr('y', y)
                            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                            .text(word)
                    }
                }
            })
        }

        const rectHeight = (d : any) => {
            return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
        }

        const labelVisible = (d : any) => {
            return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
        }

        let data = this.props.data;

        let partition : any = (data: any) => {
            const root : any = d3.hierarchy(data)
                .sum((d : any) => d.size)
                .sort((a: any, b: any) => b.value - a.value);

            // La size donne les dimensions de l'espace de projection.
            // Ici, on multiplie la largeur par
            // 2 = maxdepth / 3
            // car je veux voir 2 colonnes s'afficher.
            return d3.partition().size([this.height, 6 / 3 * this.width])(root)
        }

        let color : any = d3.scaleOrdinal()
            .range(d3.quantize(d3.interpolateViridis, data.children.length + 1))

        let format : any = d3.format(",d")

        let width : any = this.width
        let height : any = this.height

        const root = partition(data)
        let focus = root;

        const svg = d3.select('#partition-container')
            .style("width", `${this.width}px`)
            .style("height", `${this.height}px`)
            .style("overflow", "hidden")
            .style("font", "10px sans-serif");

        const cell = svg.append("g")
            .selectAll("g")
            .data(root.descendants())
            .enter().append("g")
                .attr("transform", (d: any) => `translate(${d.y0},${d.x0})`)
                .on("mouseover", _.partial(onMouseOver, this))
                .on("mouseleave", _.partial(onMouseLeave, this))

        const rect = cell.append("rect")
            .attr("width", (d : any) => d.y1 - d.y0 - 1)
            .attr("height", (d : any) => rectHeight(d))
            .attr("fill-opacity", 0.6)
            .attr("fill", (d : any) => {
                // Root node's background color
                if (!d.depth) return "#A7B6C2";
                return color(d.depth / 10);
            })
            .style("cursor", "pointer")
            .on("click", _.partial(clicked, this))

        const text = cell.append("text")
            .style("user-select", "none")
            .attr("pointer-events", "none")
            .attr("x", 4)
            .attr("y", 13)
            .attr("fill-opacity", (d : any) => +labelVisible(d))
            .text((d : any) => d.data.name)
            .call(wrap, width / 4)

        const tspan = text.append("tspan")
            .attr("fill-opacity", (d : any) => +labelVisible(d) * 0.7)
            .text((d : any) => ` ${format(d.value)}`)

        cell.append("title")
            .text((d : any) => `${d.ancestors().map((d : any) => d.data.name).reverse().join("/")}\n${format(d.value)}`)
    }

    public render() {
        return (
            <div>
                <svg
                    ref='container'
                    id={'partition-container'}
                >

                </svg>
            </div>
        )
    }
}
