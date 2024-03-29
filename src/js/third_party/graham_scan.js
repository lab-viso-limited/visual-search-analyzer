var GrahamScan = {

    execute : function(points) {
        if (points.length < 3) {
            return points;
        }

        var minimum = function(Q) {
            // Find minimum y point (in case of tie seleft leftmost)
            // Sort by y coordinate to ease the left most finding
            Q.sort(function(a,b) {
                return a.y - b.y;
            });

            var y_min = 1000000;
            var smallest = 0;
            for(var i=0; i < Q.length; ++i) {
                var p = Q[i];
                if (p.y < y_min) {
                    y_min = p.y; smallest= i;
                }
                else if (p.y == y_min) { // Select left most
                    if (Q[i-1].x > p.x) {
                        smallest = i;
                    }
                }
            }
            return smallest;
        }

        var distance = function(a, b) {
            return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
        }

        var filter_equal_angles = function(p0, Q) {
            // => If two points have same polar angle remove the farthest from p0
            // Distance can be calculated with vector length...
            for(var i=1; i < Q.length; i++) {
                if (Q[i-1].polar == Q[i].polar) {
                    var d1 = distance(p0, Q[i-1]);
                    var d2 = distance(p0, Q[i]);
                    if (d2 > d1) {
                        Q.splice(i, 1);
                    } else {
                        Q.splice(i-1, 1);
                    }
                }
            }
        }

        var cartesian_angle = function(x, y) {
            if (x > 0 && y > 0)
                return Math.atan( y / x);
            else if (x < 0 && y > 0)
                return Math.atan(-x / y) + Math.PI / 2;
            else if (x < 0 && y < 0)
                return Math.atan( y / x) + Math.PI;
            else if (x > 0 && y < 0)
                return Math.atan(-x / y) + Math.PI / 2 + Math.PI;
            else if (x == 0 && y > 0)
                return Math.PI / 2;
            else if (x < 0 && y == 0)
                return Math.PI;
            else if (x == 0 && y < 0)
                return Math.PI / 2 + Math.PI;
            else return 0;
        }

        var calculate_angle = function(p1, p2) {
            return cartesian_angle(p2.x - p1.x, p2.y - p1.y)
        }

        var calculate_polar_angles = function(p0, Q) {
            for(var i=0; i < Q.length; i++) {
                Q[i].polar = calculate_angle(p0, Q[i]);
            }
        }

        // Three points are a counter-clockwise turn
        // if ccw > 0, clockwise if ccw < 0, and collinear if ccw = 0
        var ccw = function(p1, p2, p3) {
            return (p2.x - p1.x)*(p3.y - p1.y) - (p2.y - p1.y)*(p3.x - p1.x);
        }

        // Find minimum point
        var Q = points.concat(); // Make copy
        var min = minimum(Q);
        var p0 = Q[min];
        Q.splice(min, 1);

        // Sort by polar angle to p0
        calculate_polar_angles(p0, Q);
        Q.sort(function(a,b) {
            return a.polar - b.polar;
        });

        // Remove all with same polar angle but the farthest.
        filter_equal_angles(p0, Q);

        // Graham scan
        var S = [];
        S.push(p0);
        S.push(Q[0]);
        S.push(Q[1]);
        for(var i=2; i < Q.length; ++i) {
            var pi = Q[i];
            while(ccw(S[S.length - 2], S[S.length - 1], pi) <= 0) {
                S.pop();
            }
            S.push(pi);
        }
        return S;
    }
};