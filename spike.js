neuron_radius = 20;

function Neuron(paper, x, y) {
    var soma = paper.circle(x,y, neuron_radius);
    soma.attr({fill: '#fff'});
    soma.click(function() {soma.attr({fill: '#ddd'}); });
}

function Spike() {
    var on_canvas_click = function(e) {
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;

        $("#status-bar").html("x = " + x + "; y = " + y);

        if(e.originalEvent.explicitOriginalTarget.tagName == "svg")
            neurons.push(new Neuron(paper, x, y));
    }

    var neurons = [];
    var paper = Raphael("main-bar", "100%", "100%");

    // binding handlers
    $("#main-bar").click(on_canvas_click);
}

$(document).ready(Spike);