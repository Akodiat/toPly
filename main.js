import * as THREE from "./jsm/three.module.js";

import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { PLYExporter } from "./jsm/exporters/PLYExporter.js";
import { Loader } from "./jsm/Loader.js";

let scene, camera, renderer, exporter, mesh;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(200, 100, 200);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    scene.fog = new THREE.Fog(0x222222, 200, 1000);

    exporter = new PLYExporter();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 200, 100);
    camera.add(directionalLight);

    // ground

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x777777, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const grid = new THREE.GridHelper(200, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    //

    window.addEventListener("resize", onWindowResize);

    const buttonExportASCII = document.getElementById("exportASCII");
    buttonExportASCII.addEventListener("click", exportASCII);

    const loader = new Loader(scene);
    document.getElementById('loadButton').onclick = ()=>{
        try {
            loader.loadFiles(document.getElementById("fileInput").files);
        } catch (error) {
            alert(error);
        }

    };
}

function findMeshes(object, callback) {
    if (object.type === 'Mesh') {
        callback(object)
    } else {
        object.children.forEach(c => {
            findMeshes(c, callback);
        });
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function exportASCII() {
    const lastAdded = scene.children.slice(-1)[0];
    exporter.parse(lastAdded, function (result) {
        saveString(result, `${lastAdded.name}.ply`);
    });
}

const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function saveString(text, filename) {
    save(new Blob([text], { type: "text/plain" }), filename);
}
