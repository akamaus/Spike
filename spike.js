function Spike() {
    this.paper = Raphael("main-bar", 400,300);
    var circle = this.paper.circle(50, 40, 10);
    // Sets the fill attribute of the circle to red (#f00)
    circle.attr("fill", "#f00");

    // Sets the stroke attribute of the circle to white
    circle.attr("stroke", "#fff");
}

$(document).ready(Spike);