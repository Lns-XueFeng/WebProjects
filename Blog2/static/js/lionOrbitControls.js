
THREE.OrbitControls = function(l, e) {
    this.object = l;
    this.domElement = (e !== undefined) ? e : document;
    this.enabled = true;
    this.target = new THREE.Vector3();
    this.center = this.target;
    this.noZoom = false;
    this.zoomSpeed = 1;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.minZoom = 0;
    this.maxZoom = Infinity;
    this.noRotate = false;
    this.rotateSpeed = 1;
    this.noPan = false;
    this.keyPanSpeed = 7;
    this.autoRotate = false;
    this.autoRotateSpeed = 2;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minAzimuthAngle = -Infinity;
    this.maxAzimuthAngle = Infinity;
    this.noKeys = false;
    this.keys = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        BOTTOM: 40
    };
    this.mouseButtons = {
        ORBIT: THREE.MOUSE.LEFT,
        ZOOM: THREE.MOUSE.MIDDLE,
        PAN: THREE.MOUSE.RIGHT
    };
    var F = this;
    var g = 1e-06;
    var D = new THREE.Vector2();
    var C = new THREE.Vector2();
    var B = new THREE.Vector2();
    var w = new THREE.Vector2();
    var u = new THREE.Vector2();
    var t = new THREE.Vector2();
    var v = new THREE.Vector3();
    var m = new THREE.Vector3();
    var d = new THREE.Vector2();
    var c = new THREE.Vector2();
    var b = new THREE.Vector2();
    var J;
    var x;
    var y = 0;
    var K = 0;
    var E = 1;
    var s = new THREE.Vector3();
    var j = new THREE.Vector3();
    var k = new THREE.Quaternion();
    var I = {
        NONE: -1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_DOLLY: 4,
        TOUCH_PAN: 5
    };
    var H = I.NONE;
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    var z = new THREE.Quaternion().setFromUnitVectors(l.up, new THREE.Vector3(0,1,0));
    var A = z.clone().inverse();
    var a = {
        type: "change"
    };
    var G = {
        type: "start"
    };
    var f = {
        type: "end"
    };
    this.rotateLeft = function(O) {
        if (O === undefined) {
            O = h()
        }
        K -= O
    }
    ;
    this.rotateUp = function(O) {
        if (O === undefined) {
            O = h()
        }
        y -= O
    }
    ;
    this.panLeft = function(O) {
        var P = this.object.matrix.elements;
        v.set(P[0], P[1], P[2]);
        v.multiplyScalar(-O);
        s.add(v)
    }
    ;
    this.panUp = function(O) {
        var P = this.object.matrix.elements;
        v.set(P[4], P[5], P[6]);
        v.multiplyScalar(O);
        s.add(v)
    }
    ;
    this.pan = function(O, P) {
        var Q = F.domElement === document ? F.domElement.body : F.domElement;
        if (F.object instanceof THREE.PerspectiveCamera) {
            var S = F.object.position;
            var R = S.clone().sub(F.target);
            var T = R.length();
            T *= Math.tan((F.object.fov / 2) * Math.PI / 180);
            F.panLeft(2 * O * T / Q.clientHeight);
            F.panUp(2 * P * T / Q.clientHeight)
        } else {
            if (F.object instanceof THREE.OrthographicCamera) {
                F.panLeft(O * (F.object.right - F.object.left) / Q.clientWidth);
                F.panUp(P * (F.object.top - F.object.bottom) / Q.clientHeight)
            } else {
                console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.")
            }
        }
    }
    ;
    this.dollyIn = function(O) {
        if (O === undefined) {
            O = i()
        }
        if (F.object instanceof THREE.PerspectiveCamera) {
            E /= O
        } else {
            if (F.object instanceof THREE.OrthographicCamera) {
                F.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * O));
                F.object.updateProjectionMatrix();
                F.dispatchEvent(a)
            } else {
                console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.")
            }
        }
    }
    ;
    this.dollyOut = function(O) {
        if (O === undefined) {
            O = i()
        }
        if (F.object instanceof THREE.PerspectiveCamera) {
            E *= O
        } else {
            if (F.object instanceof THREE.OrthographicCamera) {
                F.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / O));
                F.object.updateProjectionMatrix();
                F.dispatchEvent(a)
            } else {
                console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.")
            }
        }
    }
    ;
    this.update = function() {
        var O = this.object.position;
        m.copy(O).sub(this.target);
        m.applyQuaternion(z);
        J = Math.atan2(m.x, m.z);
        x = Math.atan2(Math.sqrt(m.x * m.x + m.z * m.z), m.y);
        if (this.autoRotate && H === I.NONE) {
            this.rotateLeft(h())
        }
        J += K;
        x += y;
        J = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, J));
        x = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, x));
        x = Math.max(g, Math.min(Math.PI - g, x));
        var P = m.length() * E;
        P = Math.max(this.minDistance, Math.min(this.maxDistance, P));
        this.target.add(s);
        m.x = P * Math.sin(x) * Math.sin(J);
        m.y = P * Math.cos(x);
        m.z = P * Math.sin(x) * Math.cos(J);
        m.applyQuaternion(A);
        O.copy(this.target).add(m);
        this.object.lookAt(this.target);
        K = 0;
        y = 0;
        E = 1;
        s.set(0, 0, 0);
        if (j.distanceToSquared(this.object.position) > g || 8 * (1 - k.dot(this.object.quaternion)) > g) {
            this.dispatchEvent(a);
            j.copy(this.object.position);
            k.copy(this.object.quaternion)
        }
    }
    ;
    this.reset = function() {
        H = I.NONE;
        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;
        this.object.updateProjectionMatrix();
        this.dispatchEvent(a);
        this.update()
    }
    ;
    this.getPolarAngle = function() {
        return x
    }
    ;
    this.getAzimuthalAngle = function() {
        return J
    }
    ;
    function h() {
        return 2 * Math.PI / 60 / 60 * F.autoRotateSpeed
    }
    function i() {
        return Math.pow(0.95, F.zoomSpeed)
    }
    function o(O) {
        if (F.enabled === false) {
            return
        }
        O.preventDefault();
        if (O.button === F.mouseButtons.ORBIT) {
            if (F.noRotate === true) {
                return
            }
            H = I.ROTATE;
            D.set(O.clientX, O.clientY)
        } else {
            if (O.button === F.mouseButtons.ZOOM) {
                if (F.noZoom === true) {
                    return
                }
                H = I.DOLLY;
                d.set(O.clientX, O.clientY)
            } else {
                if (O.button === F.mouseButtons.PAN) {
                    if (F.noPan === true) {
                        return
                    }
                    H = I.PAN;
                    w.set(O.clientX, O.clientY)
                }
            }
        }
        if (H !== I.NONE) {
            document.addEventListener("mousemove", p, false);
            document.addEventListener("mouseup", q, false);
            F.dispatchEvent(G)
        }
    }
    function p(P) {
        if (F.enabled === false) {
            return
        }
        P.preventDefault();
        var O = F.domElement === document ? F.domElement.body : F.domElement;
        if (H === I.ROTATE) {
            if (F.noRotate === true) {
                return
            }
            C.set(P.clientX, P.clientY);
            B.subVectors(C, D);
            F.rotateLeft(2 * Math.PI * B.x / O.clientWidth * F.rotateSpeed);
            F.rotateUp(2 * Math.PI * B.y / O.clientHeight * F.rotateSpeed);
            D.copy(C)
        } else {
            if (H === I.DOLLY) {
                if (F.noZoom === true) {
                    return
                }
                c.set(P.clientX, P.clientY);
                b.subVectors(c, d);
                if (b.y > 0) {
                    F.dollyIn()
                } else {
                    if (b.y < 0) {
                        F.dollyOut()
                    }
                }
                d.copy(c)
            } else {
                if (H === I.PAN) {
                    if (F.noPan === true) {
                        return
                    }
                    u.set(P.clientX, P.clientY);
                    t.subVectors(u, w);
                    F.pan(t.x, t.y);
                    w.copy(u)
                }
            }
        }
        if (H !== I.NONE) {
            F.update()
        }
    }
    function q() {
        if (F.enabled === false) {
            return
        }
        document.removeEventListener("mousemove", p, false);
        document.removeEventListener("mouseup", q, false);
        F.dispatchEvent(f);
        H = I.NONE
    }
    function r(P) {
        if (F.enabled === false || F.noZoom === true || H !== I.NONE) {
            return
        }
        P.preventDefault();
        P.stopPropagation();
        var O = 0;
        if (P.wheelDelta !== undefined) {
            O = P.wheelDelta
        } else {
            if (P.detail !== undefined) {
                O = -P.detail
            }
        }
        if (O > 0) {
            F.dollyOut()
        } else {
            if (O < 0) {
                F.dollyIn()
            }
        }
        F.update();
        F.dispatchEvent(G);
        F.dispatchEvent(f)
    }
    function n(O) {
        if (F.enabled === false || F.noKeys === true || F.noPan === true) {
            return
        }
        switch (O.keyCode) {
        case F.keys.UP:
            F.pan(0, F.keyPanSpeed);
            F.update();
            break;
        case F.keys.BOTTOM:
            F.pan(0, -F.keyPanSpeed);
            F.update();
            break;
        case F.keys.LEFT:
            F.pan(F.keyPanSpeed, 0);
            F.update();
            break;
        case F.keys.RIGHT:
            F.pan(-F.keyPanSpeed, 0);
            F.update();
            break
        }
    }
    function N(R) {
        if (F.enabled === false) {
            return
        }
        switch (R.touches.length) {
        case 1:
            if (F.noRotate === true) {
                return
            }
            H = I.TOUCH_ROTATE;
            D.set(R.touches[0].pageX, R.touches[0].pageY);
            break;
        case 2:
            if (F.noZoom === true) {
                return
            }
            H = I.TOUCH_DOLLY;
            var P = R.touches[0].pageX - R.touches[1].pageX;
            var Q = R.touches[0].pageY - R.touches[1].pageY;
            var O = Math.sqrt(P * P + Q * Q);
            d.set(0, O);
            break;
        case 3:
            if (F.noPan === true) {
                return
            }
            H = I.TOUCH_PAN;
            w.set(R.touches[0].pageX, R.touches[0].pageY);
            break;
        default:
            H = I.NONE
        }
        if (H !== I.NONE) {
            F.dispatchEvent(G)
        }
    }
    function M(S) {
        if (F.enabled === false) {
            return
        }
        S.preventDefault();
        S.stopPropagation();
        var R = F.domElement === document ? F.domElement.body : F.domElement;
        switch (S.touches.length) {
        case 1:
            if (F.noRotate === true) {
                return
            }
            if (H !== I.TOUCH_ROTATE) {
                return
            }
            C.set(S.touches[0].pageX, S.touches[0].pageY);
            B.subVectors(C, D);
            F.rotateLeft(2 * Math.PI * B.x / R.clientWidth * F.rotateSpeed);
            F.rotateUp(2 * Math.PI * B.y / R.clientHeight * F.rotateSpeed);
            D.copy(C);
            F.update();
            break;
        case 2:
            if (F.noZoom === true) {
                return
            }
            if (H !== I.TOUCH_DOLLY) {
                return
            }
            var P = S.touches[0].pageX - S.touches[1].pageX;
            var Q = S.touches[0].pageY - S.touches[1].pageY;
            var O = Math.sqrt(P * P + Q * Q);
            c.set(0, O);
            b.subVectors(c, d);
            if (b.y > 0) {
                F.dollyOut()
            } else {
                if (b.y < 0) {
                    F.dollyIn()
                }
            }
            d.copy(c);
            F.update();
            break;
        case 3:
            if (F.noPan === true) {
                return
            }
            if (H !== I.TOUCH_PAN) {
                return
            }
            u.set(S.touches[0].pageX, S.touches[0].pageY);
            t.subVectors(u, w);
            F.pan(t.x, t.y);
            w.copy(u);
            F.update();
            break;
        default:
            H = I.NONE
        }
    }
    function L() {
        if (F.enabled === false) {
            return
        }
        F.dispatchEvent(f);
        H = I.NONE
    }
    this.domElement.addEventListener("contextmenu", function(O) {
        O.preventDefault()
    }, false);
    this.domElement.addEventListener("mousedown", o, false);
    this.domElement.addEventListener("mousewheel", r, false);
    this.domElement.addEventListener("DOMMouseScroll", r, false);
    this.domElement.addEventListener("touchstart", N, false);
    this.domElement.addEventListener("touchend", L, false);
    this.domElement.addEventListener("touchmove", M, false);
    window.addEventListener("keydown", n, false);
    this.update()
}
;
THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
