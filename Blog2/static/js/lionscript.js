
var scene, camera, controls, fieldOfView, aspectRatio, nearPlane, farPlane, shadowLight, backLight, light, renderer, container;
var floor, lion, fan, isBlowing = false;
var HEIGHT, WIDTH, windowHalfX, windowHalfY, mousePos = {
    x: 0,
    y: 0
};
dist = 0;
function init() {
    scene = new THREE.Scene();
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 2000;
    camera = new THREE.PerspectiveCamera(fieldOfView,aspectRatio,nearPlane,farPlane);
    camera.position.z = 800;
    camera.position.y = 0;
    camera.lookAt(new THREE.Vector3(0,0,0));
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;
    container = document.getElementById("world");
    container.appendChild(renderer.domElement);
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("mousemove", handleMouseMove, false);
    document.addEventListener("mousedown", handleMouseDown, false);
    document.addEventListener("mouseup", handleMouseUp, false);
    document.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchend", handleTouchEnd, false);
    document.addEventListener("touchmove", handleTouchMove, false)
}
function onWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix()
}
function handleMouseMove(a) {
    mousePos = {
        x: a.clientX,
        y: a.clientY
    }
}
function handleMouseDown(a) {
    isBlowing = true
}
function handleMouseUp(a) {
    isBlowing = false
}
function handleTouchStart(a) {
    if (a.touches.length > 1) {
        a.preventDefault();
        mousePos = {
            x: a.touches[0].pageX,
            y: a.touches[0].pageY
        };
        isBlowing = true
    }
}
function handleTouchEnd(a) {
    isBlowing = false
}
function handleTouchMove(a) {
    if (a.touches.length == 1) {
        a.preventDefault();
        mousePos = {
            x: a.touches[0].pageX,
            y: a.touches[0].pageY
        };
        isBlowing = true
    }
}
function createLights() {
    light = new THREE.HemisphereLight(16777215,16777215,0.5);
    shadowLight = new THREE.DirectionalLight(16777215,0.8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = 0.2;
    backLight = new THREE.DirectionalLight(16777215,0.4);
    backLight.position.set(-100, 200, 50);
    backLight.shadowDarkness = 0.1;
    backLight.castShadow = true;
    scene.add(backLight);
    scene.add(light);
    scene.add(shadowLight)
}
function createFloor() {
    floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000,500),new THREE.MeshBasicMaterial({
        color: 15459815
    }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -100;
    floor.receiveShadow = true;
    scene.add(floor)
}
function createLion() {
    lion = new Lion();
    scene.add(lion.threegroup)
}
function createFan() {
    fan = new Fan();
    fan.threegroup.position.z = 350;
    scene.add(fan.threegroup)
}
Fan = function() {
    this.isBlowing = false;
    this.speed = 0;
    this.acc = 0;
    this.redMat = new THREE.MeshLambertMaterial({
        color: 11351333,
        shading: THREE.FlatShading
    });
    this.greyMat = new THREE.MeshLambertMaterial({
        color: 6635340,
        shading: THREE.FlatShading
    });
    this.yellowMat = new THREE.MeshLambertMaterial({
        color: 16634486,
        shading: THREE.FlatShading
    });
    var a = new THREE.BoxGeometry(10,10,20);
    var g = new THREE.BoxGeometry(10,10,3);
    var f = new THREE.BoxGeometry(10,30,2);
    f.applyMatrix(new THREE.Matrix4().makeTranslation(0, 25, 0));
    this.core = new THREE.Mesh(a,this.greyMat);
    var b = new THREE.Mesh(f,this.redMat);
    b.position.z = 15;
    var c = b.clone();
    c.rotation.z = Math.PI / 2;
    var d = b.clone();
    d.rotation.z = Math.PI;
    var e = b.clone();
    e.rotation.z = -Math.PI / 2;
    this.sphere = new THREE.Mesh(g,this.yellowMat);
    this.sphere.position.z = 15;
    this.propeller = new THREE.Group();
    this.propeller.add(b);
    this.propeller.add(c);
    this.propeller.add(d);
    this.propeller.add(e);
    this.threegroup = new THREE.Group();
    this.threegroup.add(this.core);
    this.threegroup.add(this.propeller);
    this.threegroup.add(this.sphere)
}
;
Fan.prototype.update = function(a, b) {
    this.threegroup.lookAt(new THREE.Vector3(0,80,60));
    this.tPosX = rule3(a, -200, 200, -250, 250);
    this.tPosY = rule3(b, -200, 200, 250, -250);
    this.threegroup.position.x += (this.tPosX - this.threegroup.position.x) / 10;
    this.threegroup.position.y += (this.tPosY - this.threegroup.position.y) / 10;
    this.targetSpeed = (this.isBlowing) ? 0.3 : 0.01;
    if (this.isBlowing && this.speed < 0.5) {
        this.acc += 0.001;
        this.speed += this.acc
    } else {
        if (!this.isBlowing) {
            this.acc = 0;
            this.speed *= 0.98
        }
    }
    this.propeller.rotation.z += this.speed
}
;
Lion = function() {
    this.windTime = 0;
    this.bodyInitPositions = [];
    this.maneParts = [];
    this.threegroup = new THREE.Group();
    this.yellowMat = new THREE.MeshLambertMaterial({
        color: 16634486,
        shading: THREE.FlatShading
    });
    this.redMat = new THREE.MeshLambertMaterial({
        color: 11351333,
        shading: THREE.FlatShading
    });
    this.pinkMat = new THREE.MeshLambertMaterial({
        color: 15031595,
        shading: THREE.FlatShading
    });
    this.whiteMat = new THREE.MeshLambertMaterial({
        color: 16777215,
        shading: THREE.FlatShading
    });
    this.purpleMat = new THREE.MeshLambertMaterial({
        color: 4528468,
        shading: THREE.FlatShading
    });
    this.greyMat = new THREE.MeshLambertMaterial({
        color: 6635340,
        shading: THREE.FlatShading
    });
    this.blackMat = new THREE.MeshLambertMaterial({
        color: 3156261,
        shading: THREE.FlatShading
    });
    var f = new THREE.CylinderGeometry(30,80,140,4);
    var t = new THREE.BoxGeometry(40,40,15);
    var l = new THREE.BoxGeometry(80,80,80);
    var A = new THREE.BoxGeometry(4,4,4);
    var w = new THREE.BoxGeometry(30,2,1);
    w.applyMatrix(new THREE.Matrix4().makeTranslation(15, 0, 0));
    var g = new THREE.BoxGeometry(20,20,20);
    var x = new THREE.BoxGeometry(40,40,20);
    var h = new THREE.BoxGeometry(5,30,30);
    var o = new THREE.BoxGeometry(4,10,10);
    var v = new THREE.BoxGeometry(20,20,10);
    var z = new THREE.TorusGeometry(12,4,2,10,Math.PI);
    var s = new THREE.BoxGeometry(40,15,20);
    var r = new THREE.BoxGeometry(25,80,80);
    r.applyMatrix(new THREE.Matrix4().makeTranslation(0, 50, 0));
    var m = new THREE.BoxGeometry(40,20,20);
    this.body = new THREE.Mesh(f,this.yellowMat);
    this.body.position.z = -60;
    this.body.position.y = -30;
    this.bodyVertices = [0, 1, 2, 3, 4, 10];
    for (var n = 0; n < this.bodyVertices.length; n++) {
        var B = this.body.geometry.vertices[this.bodyVertices[n]];
        B.z = 70;
        this.bodyInitPositions.push({
            x: B.x,
            y: B.y,
            z: B.z
        })
    }
    this.leftKnee = new THREE.Mesh(r,this.yellowMat);
    this.leftKnee.position.x = 65;
    this.leftKnee.position.z = -20;
    this.leftKnee.position.y = -110;
    this.leftKnee.rotation.z = -0.3;
    this.rightKnee = new THREE.Mesh(r,this.yellowMat);
    this.rightKnee.position.x = -65;
    this.rightKnee.position.z = -20;
    this.rightKnee.position.y = -110;
    this.rightKnee.rotation.z = 0.3;
    this.backLeftFoot = new THREE.Mesh(m,this.yellowMat);
    this.backLeftFoot.position.z = 30;
    this.backLeftFoot.position.x = 75;
    this.backLeftFoot.position.y = -90;
    this.backRightFoot = new THREE.Mesh(m,this.yellowMat);
    this.backRightFoot.position.z = 30;
    this.backRightFoot.position.x = -75;
    this.backRightFoot.position.y = -90;
    this.frontRightFoot = new THREE.Mesh(m,this.yellowMat);
    this.frontRightFoot.position.z = 40;
    this.frontRightFoot.position.x = -22;
    this.frontRightFoot.position.y = -90;
    this.frontLeftFoot = new THREE.Mesh(m,this.yellowMat);
    this.frontLeftFoot.position.z = 40;
    this.frontLeftFoot.position.x = 22;
    this.frontLeftFoot.position.y = -90;
    this.mane = new THREE.Group();
    for (var p = 0; p < 4; p++) {
        for (var q = 0; q < 4; q++) {
            var u = new THREE.Mesh(t,this.redMat);
            u.position.x = (p * 40) - 60;
            u.position.y = (q * 40) - 60;
            var a;
            var E;
            var y = Math.random() * Math.PI * 2;
            var e, d;
            var c, b;
            var C, D;
            if ((p == 0 && q == 0) || (p == 0 && q == 3) || (p == 3 && q == 0) || (p == 3 && q == 3)) {
                a = -10 - Math.floor(Math.random() * 5);
                E = -5
            } else {
                if (p == 0 || q == 0 || p == 3 || q == 3) {
                    a = -5 - Math.floor(Math.random() * 5);
                    E = 0
                } else {
                    a = 0;
                    E = 0
                }
            }
            this.maneParts.push({
                mesh: u,
                amp: a,
                zOffset: E,
                periodOffset: y,
                xInit: u.position.x,
                yInit: u.position.y
            });
            this.mane.add(u)
        }
    }
    this.mane.position.y = -10;
    this.mane.position.z = 80;
    this.face = new THREE.Mesh(l,this.yellowMat);
    this.face.position.z = 135;
    this.mustaches = [];
    this.mustache1 = new THREE.Mesh(w,this.greyMat);
    this.mustache1.position.x = 30;
    this.mustache1.position.y = -5;
    this.mustache1.position.z = 175;
    this.mustache2 = this.mustache1.clone();
    this.mustache2.position.x = 35;
    this.mustache2.position.y = -12;
    this.mustache3 = this.mustache1.clone();
    this.mustache3.position.y = -19;
    this.mustache3.position.x = 30;
    this.mustache4 = this.mustache1.clone();
    this.mustache4.rotation.z = Math.PI;
    this.mustache4.position.x = -30;
    this.mustache5 = new THREE.Mesh(w,this.blackMat);
    this.mustache5 = this.mustache2.clone();
    this.mustache5.rotation.z = Math.PI;
    this.mustache5.position.x = -35;
    this.mustache6 = new THREE.Mesh(w,this.blackMat);
    this.mustache6 = this.mustache3.clone();
    this.mustache6.rotation.z = Math.PI;
    this.mustache6.position.x = -30;
    this.mustaches.push(this.mustache1);
    this.mustaches.push(this.mustache2);
    this.mustaches.push(this.mustache3);
    this.mustaches.push(this.mustache4);
    this.mustaches.push(this.mustache5);
    this.mustaches.push(this.mustache6);
    this.spot1 = new THREE.Mesh(A,this.redMat);
    this.spot1.position.x = 39;
    this.spot1.position.z = 150;
    this.spot2 = this.spot1.clone();
    this.spot2.position.z = 160;
    this.spot2.position.y = -10;
    this.spot3 = this.spot1.clone();
    this.spot3.position.z = 140;
    this.spot3.position.y = -15;
    this.spot4 = this.spot1.clone();
    this.spot4.position.z = 150;
    this.spot4.position.y = -20;
    this.spot5 = this.spot1.clone();
    this.spot5.position.x = -39;
    this.spot6 = this.spot2.clone();
    this.spot6.position.x = -39;
    this.spot7 = this.spot3.clone();
    this.spot7.position.x = -39;
    this.spot8 = this.spot4.clone();
    this.spot8.position.x = -39;
    this.leftEye = new THREE.Mesh(h,this.whiteMat);
    this.leftEye.position.x = 40;
    this.leftEye.position.z = 120;
    this.leftEye.position.y = 25;
    this.rightEye = new THREE.Mesh(h,this.whiteMat);
    this.rightEye.position.x = -40;
    this.rightEye.position.z = 120;
    this.rightEye.position.y = 25;
    this.leftIris = new THREE.Mesh(o,this.purpleMat);
    this.leftIris.position.x = 42;
    this.leftIris.position.z = 120;
    this.leftIris.position.y = 25;
    this.rightIris = new THREE.Mesh(o,this.purpleMat);
    this.rightIris.position.x = -42;
    this.rightIris.position.z = 120;
    this.rightIris.position.y = 25;
    this.mouth = new THREE.Mesh(v,this.blackMat);
    this.mouth.position.z = 171;
    this.mouth.position.y = -30;
    this.mouth.scale.set(0.5, 0.5, 1);
    this.smile = new THREE.Mesh(z,this.greyMat);
    this.smile.position.z = 173;
    this.smile.position.y = -15;
    this.smile.rotation.z = -Math.PI;
    this.lips = new THREE.Mesh(s,this.yellowMat);
    this.lips.position.z = 165;
    this.lips.position.y = -45;
    this.rightEar = new THREE.Mesh(g,this.yellowMat);
    this.rightEar.position.x = -50;
    this.rightEar.position.y = 50;
    this.rightEar.position.z = 105;
    this.leftEar = new THREE.Mesh(g,this.yellowMat);
    this.leftEar.position.x = 50;
    this.leftEar.position.y = 50;
    this.leftEar.position.z = 105;
    this.nose = new THREE.Mesh(x,this.greyMat);
    this.nose.position.z = 170;
    this.nose.position.y = 25;
    this.head = new THREE.Group();
    this.head.add(this.face);
    this.head.add(this.mane);
    this.head.add(this.rightEar);
    this.head.add(this.leftEar);
    this.head.add(this.nose);
    this.head.add(this.leftEye);
    this.head.add(this.rightEye);
    this.head.add(this.leftIris);
    this.head.add(this.rightIris);
    this.head.add(this.mouth);
    this.head.add(this.smile);
    this.head.add(this.lips);
    this.head.add(this.spot1);
    this.head.add(this.spot2);
    this.head.add(this.spot3);
    this.head.add(this.spot4);
    this.head.add(this.spot5);
    this.head.add(this.spot6);
    this.head.add(this.spot7);
    this.head.add(this.spot8);
    this.head.add(this.mustache1);
    this.head.add(this.mustache2);
    this.head.add(this.mustache3);
    this.head.add(this.mustache4);
    this.head.add(this.mustache5);
    this.head.add(this.mustache6);
    this.head.position.y = 60;
    this.threegroup.add(this.body);
    this.threegroup.add(this.head);
    this.threegroup.add(this.leftKnee);
    this.threegroup.add(this.rightKnee);
    this.threegroup.add(this.backLeftFoot);
    this.threegroup.add(this.backRightFoot);
    this.threegroup.add(this.frontRightFoot);
    this.threegroup.add(this.frontLeftFoot);
    this.threegroup.traverse(function(i) {
        if (i instanceof THREE.Mesh) {
            i.castShadow = true;
            i.receiveShadow = true
        }
    })
}
;
Lion.prototype.updateBody = function(a) {
    this.head.rotation.y += (this.tHeagRotY - this.head.rotation.y) / a;
    this.head.rotation.x += (this.tHeadRotX - this.head.rotation.x) / a;
    this.head.position.x += (this.tHeadPosX - this.head.position.x) / a;
    this.head.position.y += (this.tHeadPosY - this.head.position.y) / a;
    this.head.position.z += (this.tHeadPosZ - this.head.position.z) / a;
    this.leftEye.scale.y += (this.tEyeScale - this.leftEye.scale.y) / (a * 2);
    this.rightEye.scale.y = this.leftEye.scale.y;
    this.leftIris.scale.y += (this.tIrisYScale - this.leftIris.scale.y) / (a * 2);
    this.rightIris.scale.y = this.leftIris.scale.y;
    this.leftIris.scale.z += (this.tIrisZScale - this.leftIris.scale.z) / (a * 2);
    this.rightIris.scale.z = this.leftIris.scale.z;
    this.leftIris.position.y += (this.tIrisPosY - this.leftIris.position.y) / a;
    this.rightIris.position.y = this.leftIris.position.y;
    this.leftIris.position.z += (this.tLeftIrisPosZ - this.leftIris.position.z) / a;
    this.rightIris.position.z += (this.tRightIrisPosZ - this.rightIris.position.z) / a;
    this.rightKnee.rotation.z += (this.tRightKneeRotZ - this.rightKnee.rotation.z) / a;
    this.leftKnee.rotation.z += (this.tLeftKneeRotZ - this.leftKnee.rotation.z) / a;
    this.lips.position.x += (this.tLipsPosX - this.lips.position.x) / a;
    this.lips.position.y += (this.tLipsPosY - this.lips.position.y) / a;
    this.smile.position.x += (this.tSmilePosX - this.smile.position.x) / a;
    this.mouth.position.z += (this.tMouthPosZ - this.mouth.position.z) / a;
    this.smile.position.z += (this.tSmilePosZ - this.smile.position.z) / a;
    this.smile.position.y += (this.tSmilePosY - this.smile.position.y) / a;
    this.smile.rotation.z += (this.tSmileRotZ - this.smile.rotation.z) / a
}
;
Lion.prototype.look = function(e, f) {
    this.tHeagRotY = rule3(e, -200, 200, -Math.PI / 4, Math.PI / 4);
    this.tHeadRotX = rule3(f, -200, 200, -Math.PI / 4, Math.PI / 4);
    this.tHeadPosX = rule3(e, -200, 200, 70, -70);
    this.tHeadPosY = rule3(f, -140, 260, 20, 100);
    this.tHeadPosZ = 0;
    this.tEyeScale = 1;
    this.tIrisYScale = 1;
    this.tIrisZScale = 1;
    this.tIrisPosY = rule3(f, -200, 200, 35, 15);
    this.tLeftIrisPosZ = rule3(e, -200, 200, 130, 110);
    this.tRightIrisPosZ = rule3(e, -200, 200, 110, 130);
    this.tLipsPosX = 0;
    this.tLipsPosY = -45;
    this.tSmilePosX = 0;
    this.tMouthPosZ = 174;
    this.tSmilePosZ = 173;
    this.tSmilePosY = -15;
    this.tSmileRotZ = -Math.PI;
    this.tRightKneeRotZ = rule3(e, -200, 200, 0.3 - Math.PI / 8, 0.3 + Math.PI / 8);
    this.tLeftKneeRotZ = rule3(e, -200, 200, -0.3 - Math.PI / 8, -0.3 + Math.PI / 8);
    this.updateBody(10);
    this.mane.rotation.y = 0;
    this.mane.rotation.x = 0;
    for (var a = 0; a < this.maneParts.length; a++) {
        var b = this.maneParts[a].mesh;
        b.position.z = 0;
        b.rotation.y = 0
    }
    for (var a = 0; a < this.mustaches.length; a++) {
        var b = this.mustaches[a];
        b.rotation.y = 0
    }
    for (var a = 0; a < this.bodyVertices.length; a++) {
        var d = this.bodyInitPositions[a];
        var c = this.body.geometry.vertices[this.bodyVertices[a]];
        c.x = d.x + this.head.position.x
    }
    this.body.geometry.verticesNeedUpdate = true
}
;
Lion.prototype.cool = function(h, j) {
    this.tHeagRotY = rule3(h, -200, 200, Math.PI / 4, -Math.PI / 4);
    this.tHeadRotX = rule3(j, -200, 200, Math.PI / 4, -Math.PI / 4);
    this.tHeadPosX = rule3(h, -200, 200, -70, 70);
    this.tHeadPosY = rule3(j, -140, 260, 100, 20);
    this.tHeadPosZ = 100;
    this.tEyeScale = 0.1;
    this.tIrisYScale = 0.1;
    this.tIrisZScale = 3;
    this.tIrisPosY = 20;
    this.tLeftIrisPosZ = 120;
    this.tRightIrisPosZ = 120;
    this.tLipsPosX = rule3(h, -200, 200, -15, 15);
    this.tLipsPosY = rule3(j, -200, 200, -45, -40);
    this.tMouthPosZ = 168;
    this.tSmilePosX = rule3(h, -200, 200, -15, 15);
    this.tSmilePosY = rule3(j, -200, 200, -20, -8);
    this.tSmilePosZ = 176;
    this.tSmileRotZ = rule3(h, -200, 200, -Math.PI - 0.3, -Math.PI + 0.3);
    this.tRightKneeRotZ = rule3(h, -200, 200, 0.3 + Math.PI / 8, 0.3 - Math.PI / 8);
    this.tLeftKneeRotZ = rule3(h, -200, 200, -0.3 + Math.PI / 8, -0.3 - Math.PI / 8);
    this.updateBody(10);
    this.mane.rotation.y = -0.8 * this.head.rotation.y;
    this.mane.rotation.x = -0.8 * this.head.rotation.x;
    var b = 20000 / (h * h + j * j);
    b = Math.max(Math.min(b, 1), 0.5);
    this.windTime += b;
    for (var c = 0; c < this.maneParts.length; c++) {
        var d = this.maneParts[c].mesh;
        var a = this.maneParts[c].amp;
        var k = this.maneParts[c].zOffset;
        var e = this.maneParts[c].periodOffset;
        d.position.z = k + Math.cos(this.windTime + e) * a * b * 2
    }
    this.leftEar.rotation.x = Math.cos(this.windTime) * Math.PI / 16 * b;
    this.rightEar.rotation.x = -Math.cos(this.windTime) * Math.PI / 16 * b;
    for (var c = 0; c < this.mustaches.length; c++) {
        var d = this.mustaches[c];
        var a = (c < 3) ? -Math.PI / 8 : Math.PI / 8;
        d.rotation.y = a + Math.cos(this.windTime + c) * b * a
    }
    for (var c = 0; c < this.bodyVertices.length; c++) {
        var g = this.bodyInitPositions[c];
        var f = this.body.geometry.vertices[this.bodyVertices[c]];
        f.x = g.x + this.head.position.x
    }
    this.body.geometry.verticesNeedUpdate = true
}
;
function loop() {
    render();
    var a = (mousePos.x - windowHalfX);
    var b = (mousePos.y - windowHalfY);
    fan.isBlowing = isBlowing;
    fan.update(a, b);
    if (isBlowing) {
        lion.cool(a, b)
    } else {
        lion.look(a, b)
    }
    requestAnimationFrame(loop)
}
function render() {
    if (controls) {
        controls.update()
    }
    renderer.render(scene, camera)
}
init();
createLights();
createFloor();
createLion();
createFan();
loop();
function clamp(c, b, a) {
    return Math.min(Math.max(c, b), a)
}
function rule3(h, j, i, f, e) {
    var c = Math.max(Math.min(h, i), j);
    var b = i - j;
    var d = (c - j) / b;
    var a = e - f;
    var g = f + (d * a);
    return g
}
