neuron_radius = 20;

function Pos(x,y) {
    this.x = x;
    this.y = y;
}
Pos.prototype.toString = function() {
    return this.x + " " + this.y;
};

function Neuron(x, y) {
    this.num = Neuron.new_num++;
    this.soma = this.paper.circle(x,y, neuron_radius);
    this.soma.neuron = this;
    this.outgoing_links = [];
    this.incoming_links = [];

    this.soma.attr({fill: '#fff'});

    var on_drag_start = function() {
        this.opos = this.getPos();
        this.attr({'stroke-width': 3});
    };

    var on_drag_stop = function() {
        this.attr({'stroke-width': 1});
    };

    var on_drag_move = function(dx, dy) {
        this.setPos({x: this.opos.x + dx, y: this.opos.y + dy});
        $(this.neuron.outgoing_links).each(function(k,v) {v.redraw(); });
        $(this.neuron.incoming_links).each(function(k,v) {v.redraw(); });
    };
    this.soma.drag(on_drag_move, on_drag_start, on_drag_stop);

    this.soma.click(function() {
            var n1 = Neuron.selected,
                n2 = this.neuron;

            if (n1 && n1 != n2 && !Neuron.linked(n1,n2)) {
                new Link(n1,n2);
                Neuron.selected = undefined;
            } else {
                Neuron.selected = this.neuron;
            }
        });

    this.neurons.push(this);
}

Neuron.prototype.toString = function() {return "N " + this.num; };
Neuron.prototype.getPos = function() { return this.soma.getPos(); };
Neuron.prototype.setPos = function(p) { this.soma.setPos(p); };
Neuron.linked = function(n1,n2) {
        for (i in n1.outgoing_links) {
        if (n1.outgoing_links[i].n2 === n2) return true;
    }
    return false;
};

function Link(n1, n2) {
    this.n1 = n1;
    this.n2 = n2;
    n1.outgoing_links.push(this);
    n2.incoming_links.push(this);
    this.axon = this.paper.path("M" + n1.getPos() + "L" + n2.getPos());
}

Link.prototype.toString = function() { return this.n1 + " -> " + this.n2; };
Link.prototype.redraw = function() {this.axon.attr({path: "M" + this.n1.getPos() + "L" + this.n2.getPos()}); };

function Spike() {
    var on_canvas_click = function(e) {
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;

        $("#status-bar").html("x = " + x + "; y = " + y);

        if(e.originalEvent.explicitOriginalTarget.tagName == "svg")
            new Neuron(x, y);
    };

    var neurons = [];
    var links = [];
    var paper = Raphael("main-bar", "100%", "100%");
    Neuron.prototype.paper = paper;
    Neuron.prototype.neurons = neurons;
    Neuron.new_num = 1;
    Link.prototype.paper = paper;
    Link.prototype.links = links;

    var c = paper.circle();
    c.__proto__.getPos = function() {
        return new Pos(this.attr("cx"), this.attr("cy"));
    };
    c.__proto__.setPos = function(pos) {
        this.attr({cx: pos.x, cy: pos.y});
    };
    c.remove();

    // binding handlers
    $("#main-bar").click(on_canvas_click);
}

$(document).ready(Spike);