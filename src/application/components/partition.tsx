import * as React from 'react'
import * as d3 from 'd3'
import * as _ from 'lodash'

import {clickedSunburstPoint} from '../actions/sunburst'


interface IProps {
    data: any;
    dataLoadedTime: number;
    dispatch: any;
}

interface IState {

}

export default class Partition extends React.Component<IProps, IState> {
    width: number;
    height: number;

    constructor(props: IProps) {
        super(props)
        // this.width = 900
    }

    public componentDidMount() {
        console.log('componentDidMount')
        this.width = document.getElementById('partition-view').clientWidth
        this.height = document.getElementById('partition-view').clientHeight - 20
        if (this.props.data) {
            this.drawPartition()
        }
    }

    public shouldComponentUpdate(nextProps: IProps, nextState: IState) {
        console.log('shouldComponentUpdate')

        // If loaded time for input data is different,
        // then one should update this component.
        if (nextProps.dataLoadedTime != this.props.dataLoadedTime) {
            return true
        }

        return false
    }

    public componentDidUpdate() {
        this.clearPartition()
        this.drawPartition()
    }

    public clearPartition() {
        console.log('clearPartition')
        const svg : any = d3.select('#partition-container')
            .select('g')
            .remove();
    }

    public drawPartition() {
        console.log('drawPartition');

        let data = this.props.data;

        let partition : any = (data: any) => {
            const root : any = d3.hierarchy(data)
                .sum((d : any) => d.size)
                .sort((a: any, b: any) => b.value - a.value);

            // La size donne les dimensions de l'espace de projection.
            // Ici, on multiplie la largeur par
            // 2 = maxdepth / 3
            // car je veux voir 2 colonnes s'afficher.
            return d3.partition().size([this.height, 5 / 3 * this.width])(root)
        }

        let color : any = d3.scaleOrdinal()
            .range(d3.quantize(d3.interpolateViridis, data.children.length + 1))

        let format : any = d3.format(",d")

        let width : any = this.width
        let height : any = this.height

        const root = partition(data);
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
                .attr("transform", (d: any) => `translate(${d.y0},${d.x0})`);

        const rect = cell.append("rect")
            .attr("width", (d : any) => d.y1 - d.y0 - 1)
            .attr("height", (d : any) => rectHeight(d))
            .attr("fill-opacity", 0.6)
            .attr("fill", (d : any) => {
                if (!d.depth) return "#ccc";
                return color(d.depth / 10);
                // while (d.depth > 1) d = d.parent;
                // return color(d.data.name);
            })
            .style("cursor", "pointer")
            .on("click", _.partial(clicked, this));

        const text = cell.append("text")
            .style("user-select", "none")
            .attr("pointer-events", "none")
            .attr("x", 4)
            .attr("y", 13)
            .attr("fill-opacity", (d : any) => +labelVisible(d))
            .text((d : any) => d.data.name)

        const tspan = text.append("tspan")
            .attr("fill-opacity", (d : any) => +labelVisible(d) * 0.7)
            .text((d : any) => ` ${format(d.value)}`);

        cell.append("title")
            .text((d : any) => `${d.ancestors().map((d : any) => d.data.name).reverse().join("/")}\n${format(d.value)}`)

        function clicked(that: any, p : any) {
            // focus = focus === p ? p = p.parent : p;
            focus = p;

            root.each((d : any) => d.target = {
                x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
                x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
                y0: d.y0 - p.y0,
                y1: d.y1 - p.y0
            })

            root.each((d: any) => {
                if (rectVisible(d)) {
                    console.log(true)
                }
            })
            console.log('next')

            const t = cell.transition().duration(750)
                .filter((d: any) : any => rectVisible(d))
                .attr("transform", (d : any) => `translate(${d.target.y0 + (focus.depth == 0 ? 0 : 50)},${d.target.x0})`);

            rect.transition(t)
                .attr("height", (d : any) => rectHeight(d.target));
            text.transition(t)
                .attr("fill-opacity", (d : any) => +labelVisible(d.target));
            tspan.transition(t)
                .attr("fill-opacity", (d : any) => +labelVisible(d.target) * 0.7);

            that.props.dispatch(clickedSunburstPoint(p))
        }

        function rectVisible(d : any) : any {
            // Returns true if rectangle y coordinate makes it potentially visible
            return d.target.y0 <= width && d.target.y1 >= (- width / 3)
        }

        function rectHeight(d : any) {
            return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
        }

        function labelVisible(d : any) {
            return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
        }

        function wrap(textNodes: any, width: number) {
            console.log(textNodes)
            textNodes.each((textNode: any) => {
                console.log(textNode)
                let words = textNode.text().split(/\s+/).reverse(),
                    word,
                    line : any = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    x = text.attr("x"),
                    y = text.attr("y"),
                    dy = 0, //parseFloat(text.attr("dy")),
                    tspan = text.text(null)
                                .append("tspan")
                                .attr("x", x)
                                .attr("y", y)
                                .attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    let node = tspan.node() as any
                    if (node.getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                                    .attr("x", x)
                                    .attr("y", y)
                                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                    .text(word);
                    }
                }
            });
        }
    }

    public render() {
        console.log('render');

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