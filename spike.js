neuron_radius = 20;

function Spike() {
function Neuron(paper, x, y) {
    var soma = paper.circle(x,y, neuron_radius);
    soma.attr({fill: '#fff'});

    soma.getPos = function() {
        return {x: this.attr("cx"), y: this.attr("cy")};
    }
    soma.setPos = function(pos) {
        this.attr({cx: pos.x, cy: pos.y});
    }

    var on_drag_start = function() {
        this.opos = this.getPos();
        this.attr({'stroke-width': 3});
    }

    var on_drag_stop = function() {
        this.attr({'stroke-width': 1});
    }

    var on_drag_move = function(dx, dy) {
        this.setPos({x: this.opos.x + dx, y: this.opos.y + dy});
    }
    soma.drag(on_drag_move, on_drag_start, on_drag_stop);

    soma.click(function() {
            if (Neuron.selected) {
                alert(Neuron.selected);
                Neuron.selected = undefined;
            } else {
                Neuron.selected = this;
            }
        });
}

function Link(paper, n1, n2) {
    var axon = paper.path("M");
}

    var on_canvas_click = function(e) {
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;

        $("#status-bar").html("x = " + x + "; y = " + y);

        if(e.originalEvent.explicitOriginalTarget.tagName == "svg")
            neurons.push(new Neuron(paper, x, y));
    }

    var neurons = [];
    var links = [];
    var paper = Raphael("main-bar", "100%", "100%");

    // binding handlers
    $("#main-bar").click(on_canvas_click);
}

$(document).ready(Spike);