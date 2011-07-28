neuron_radius = 20;

// Coefficients of FitzHugh-Nagumo model
a = -0.7;
b = 0.8;
tau = 1/0.08;
// initial conditions
v0 = -0.9;
w0 = 0.24;

dt = 0.2;

manual_stimilus = 1;
transmit_coef = 0.5;

// Language augmentation
Array.prototype.delete = function(obj) {
    var i = this.indexOf(obj);
    if (i >= 0)
        this.splice(i,1);
    return this;
};

// 2D point
function Pos(x,y) {
    this.x = x;
    this.y = y;
}
Pos.prototype.toString = function() {
    return this.x + " " + this.y;
};

// mapping from [o1,o2] into [d1,d2]
function affine(o1,o2,d1,d2, x) {
    var p = (x-o1) / (o2-o1);
    return d1 + (d2-d1)*p;
};

function int_map(o1,o2,d1,d2, x) {
    var res = affine(o1,o2,d1,d2, x);
    if (d1<d2) {
        var min = d1,max = d2;
    } else
        var min = d2,max = d1;
    if (res < min) res = min;
    else if (res > max) res = max;
    return Math.round(res);
};

// Neuron related

function Neuron(x, y) {
    this.num = Neuron.new_num++;
    this.soma = this.paper.circle(x,y, neuron_radius);
    this.soma.neuron = this;
    this.soma.node.neuron = this;
    this.outgoing_links = [];
    this.incoming_links = [];

    this.v = v0; // potential
    this.w = w0; // stabilizer
    this.i = 0; // summary external current
    this.i_prev = 0; // summary external current

    this.neurons.push(this);

    this.soma.drag(on_drag_move, on_drag_start, on_drag_stop);

    this.soma.dblclick(function() { this.neuron.stimulate(); });
    this.soma.click(function() {this.neuron.select(); });

    $(this.soma.node).bind("mousedown", on_mouse_down);

    this.redraw();
}

Neuron.prototype.getPos = function() { return this.soma.getPos(); };
Neuron.prototype.setPos = function(p) { this.soma.setPos(p); };

Neuron.prototype.tick = function() {
    var v = this.v,
        w = this.w,
        i = this.i_prev; // incoming current from last tick
    var dv = v - v*v*v - w + i;
    var dw = (v - a - b*w)/tau;

    this.v += dv*dt;
    this.w += dw*dt;

    if (this.v > 0) // transmitting impulse
        for (i in this.outgoing_links) {
            this.outgoing_links[i].n2.i += transmit_coef * this.v;
        }
};

// Neuron UI

function on_drag_start() {
    this.opos = this.getPos();
    this.attr({'stroke-width': 3});
};

function on_drag_stop() {
    this.attr({'stroke-width': 1});
};

function on_drag_move(dx, dy) {
    this.setPos({x: this.opos.x + dx, y: this.opos.y + dy});
    $(this.neuron.outgoing_links).each(function(k,v) {v.redraw(); });
    $(this.neuron.incoming_links).each(function(k,v) {v.redraw(); });
};

function on_mouse_down(e) {
    switch(e.which) {
    case 2:
        var n1 = Neuron.selected,
        n2 = this.neuron;
        if (n1 && n1 != n2 && !Neuron.linked(n1,n2)) {
            new Link(n1,n2);
        }
        n2.select();
        break;
        case 3:
        this.neuron.remove();
        break;
    }
}

Neuron.prototype.stimulate = function() {
    this.v += manual_stimilus;
};

Neuron.prototype.select = function() {
    if (Neuron.selected) {
        Neuron.selected.soma.attr({"stroke-dasharray": ""});
    }
    Neuron.selected = this;
    Neuron.selected.soma.attr({"stroke-dasharray": "--"});
    $('#status-bar').html(this.outgoing_links.length);
};

Neuron.prototype.toString = function() {return "N " + this.num; };

Neuron.prototype.redraw = function() {
    this.soma.attr({fill: "rgb(" + int_map(-1.5,1.5, 0, 255, this.v) +"," + int_map(-1.5,1.5, 255, 0, this.v) +",0)"});
};

Neuron.linked = function(n1,n2) {
        for (i in n1.outgoing_links) {
        if (n1.outgoing_links[i].n2 === n2) return true;
    }
    return false;
};

Neuron.prototype.remove = function() {
    alert('remove');
    $(this.incoming_links).each(function(k,l) { l.remove(); });
    $(this.outgoing_links).each(function(k,l) { l.remove(); });
    this.neurons.delete(this);
    this.soma.remove();
};

// Link related
function Link(n1, n2) {
    this.n1 = n1;
    this.n2 = n2;
    n1.outgoing_links.push(this);
    n2.incoming_links.push(this);
    this.axon = this.paper.path("M" + n1.getPos() + "L" + n2.getPos());
}

Link.prototype.remove = function() {
    this.n1.outgoing_links.delete(this);
    this.n2.incoming_links.delete(this);
    this.axon.remove();
};

Link.prototype.toString = function() { return this.n1 + " -> " + this.n2; };
Link.prototype.redraw = function() {this.axon.attr({path: "M" + this.n1.getPos() + "L" + this.n2.getPos()}); };

function Spike() {

    var neurons = [];
    var links = [];
    var paper = Raphael("main-bar", "100%", "100%");
    Neuron.prototype.paper = paper;
    Neuron.prototype.neurons = neurons;
    Neuron.new_num = 1;
    Neuron.selected = undefined;
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

    // handlers
    function on_canvas_click(e) {
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;

        if(e.originalEvent.explicitOriginalTarget.tagName == "svg")
            new Neuron(x, y);
    };

    function on_tick() {
        for (var i=1;i<=2; i++) {
            $(neurons).each(function(k,n) {n.i_prev = n.i; n.i = 0; });
            $(neurons).each(function(k,n) {n.tick(); });
        }
        $(neurons).each(function(k,n) {n.redraw(); });
    }


    // binding handlers
    $("#main-bar").click(on_canvas_click);
    setInterval(on_tick, 100);
}

$(document).ready(Spike);