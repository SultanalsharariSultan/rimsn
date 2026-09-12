import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

export type GameHandle = { scene: Scene; dispose: () => void };

type GameState = {
  started: boolean;
  shards: number;
  totalShards: number;
  speed: number;
  fuel: number;
  health: number;
  time: string;
  district: string;
  message: string;
  missionComplete: boolean;
  playerX: number;
  playerZ: number;
  dayProgress: number;
};

const KEY_ART = "/manus-storage/open-world-arabia-keyart_444303e0.png";
const EMBLEM = "/manus-storage/open-world-arabia-emblem_6deb2ec1.png";

const makeMaterial = (scene: Scene, name: string, color: Color3, emissive?: Color3) => {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.specularColor = new Color3(0.12, 0.12, 0.12);
  if (emissive) material.emissiveColor = emissive;
  return material;
};

const distance2D = (a: Vector3, b: Vector3) => Math.hypot(a.x - b.x, a.z - b.z);

class Vehicle {
  readonly root: TransformNode;
  readonly position: Vector3;
  yaw = 0;
  speed = 0;

  constructor(scene: Scene, materials: Record<string, StandardMaterial>) {
    this.root = new TransformNode("sura-explorer", scene);
    this.position = this.root.position;

    const body = MeshBuilder.CreateBox("explorer-body", { width: 3.8, height: 0.7, depth: 5.8 }, scene);
    body.position.y = 1.05;
    body.material = materials.gold;
    body.parent = this.root;

    const cabin = MeshBuilder.CreateBox("explorer-cabin", { width: 2.9, height: 0.95, depth: 2.55 }, scene);
    cabin.position.set(0, 1.75, -0.25);
    cabin.material = materials.glass;
    cabin.parent = this.root;

    const hood = MeshBuilder.CreateBox("explorer-hood", { width: 3.35, height: 0.23, depth: 1.45 }, scene);
    hood.position.set(0, 1.42, 1.72);
    hood.material = materials.turquoise;
    hood.parent = this.root;

    const bumper = MeshBuilder.CreateBox("explorer-bumper", { width: 3.55, height: 0.22, depth: 0.25 }, scene);
    bumper.position.set(0, 0.78, 2.9);
    bumper.material = materials.dark;
    bumper.parent = this.root;

    for (const x of [-1.75, 1.75]) {
      for (const z of [-1.75, 1.75]) {
        const wheel = MeshBuilder.CreateCylinder(`explorer-wheel-${x}-${z}`, { diameter: 1.1, height: 0.42, tessellation: 16 }, scene);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.72, z);
        wheel.material = materials.dark;
        wheel.parent = this.root;
      }
    }

    const beacon = MeshBuilder.CreateSphere("explorer-beacon", { diameter: 0.34, segments: 12 }, scene);
    beacon.position.set(0, 2.37, -0.25);
    beacon.material = materials.pulse;
    beacon.parent = this.root;
  }

  update(delta: number, keys: Set<string>, active: boolean) {
    const throttle = keys.has("w") || keys.has("arrowup") ? 1 : keys.has("s") || keys.has("arrowdown") ? -0.65 : 0;
    const steer = (keys.has("a") || keys.has("arrowleft") ? -1 : 0) + (keys.has("d") || keys.has("arrowright") ? 1 : 0);
    const maxSpeed = 22;
    const targetSpeed = active ? throttle * maxSpeed : 0;
    this.speed += (targetSpeed - this.speed) * Math.min(1, delta * 4.2);
    this.yaw += steer * (0.72 + Math.abs(this.speed) * 0.055) * delta * (this.speed >= 0 ? 1 : -1);
    this.position.x += Math.sin(this.yaw) * this.speed * delta;
    this.position.z += Math.cos(this.yaw) * this.speed * delta;
    this.position.x = Math.max(-88, Math.min(88, this.position.x));
    this.position.z = Math.max(-88, Math.min(88, this.position.z));
    this.root.rotation.y = this.yaw;
  }
}

function createPalm(scene: Scene, materials: Record<string, StandardMaterial>, x: number, z: number, scale = 1) {
  const root = new TransformNode(`palm-${x}-${z}`, scene);
  root.position.set(x, 0, z);
  root.scaling.setAll(scale);
  const trunk = MeshBuilder.CreateCylinder("palm-trunk", { diameterTop: 0.32, diameterBottom: 0.62, height: 4.8, tessellation: 9 }, scene);
  trunk.position.y = 2.4;
  trunk.material = materials.trunk;
  trunk.parent = root;
  for (let i = 0; i < 7; i++) {
    const leaf = MeshBuilder.CreateSphere("palm-leaf", { diameter: 2.1, segments: 8 }, scene);
    leaf.scaling.set(1.8, 0.16, 0.42);
    leaf.position.y = 5.05;
    leaf.rotation.y = (Math.PI * 2 * i) / 7;
    leaf.rotation.z = -0.22;
    leaf.material = materials.leaf;
    leaf.parent = root;
  }
}

function createBuilding(scene: Scene, materials: Record<string, StandardMaterial>, x: number, z: number, seed: number) {
  const height = 5 + (seed % 5) * 1.4;
  const width = 7 + (seed % 3) * 1.6;
  const depth = 7 + ((seed + 1) % 3) * 1.8;
  const body = MeshBuilder.CreateBox(`building-${x}-${z}`, { width, height, depth }, scene);
  body.position.set(x, height / 2, z);
  body.material = seed % 2 ? materials.sandstone : materials.rose;
  const roof = MeshBuilder.CreateCylinder(`roof-${x}-${z}`, { diameter: Math.min(width, depth) * 0.9, height: 0.8, tessellation: 6 }, scene);
  roof.position.set(x, height + 0.45, z);
  roof.material = materials.gold;
  const windowMat = seed % 3 === 0 ? materials.pulse : materials.window;
  for (const side of [-1, 1]) {
    for (let row = 0; row < Math.min(3, Math.floor(height / 2)); row++) {
      const window = MeshBuilder.CreateBox(`window-${x}-${z}-${side}-${row}`, { width: 0.7, height: 0.55, depth: 0.08 }, scene);
      window.position.set(x + side * (width / 2 + 0.04), 1.4 + row * 1.65, z - depth * 0.2 + (row % 2) * 1.8);
      window.material = windowMat;
    }
  }
}

function createBeacon(scene: Scene, materials: Record<string, StandardMaterial>, x: number, z: number, index: number) {
  const root = new TransformNode(`light-shard-${index}`, scene);
  root.position.set(x, 1.8, z);
  const stem = MeshBuilder.CreateCylinder(`shard-stem-${index}`, { diameter: 0.16, height: 2.4, tessellation: 8 }, scene);
  stem.material = materials.turquoise;
  stem.parent = root;
  const crystal = MeshBuilder.CreatePolyhedron(`shard-crystal-${index}`, { type: 1, size: 1.1 }, scene);
  crystal.position.y = 1.55;
  crystal.scaling.y = 1.5;
  crystal.material = materials.pulse;
  crystal.parent = root;
  const ring = MeshBuilder.CreateTorus(`shard-ring-${index}`, { diameter: 2.4, thickness: 0.06, tessellation: 32 }, scene);
  ring.rotation.x = Math.PI / 2;
  ring.material = materials.turquoise;
  ring.parent = root;
  return root;
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.035, 0.055, 0.13, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0045;
  scene.fogColor = new Color3(0.12, 0.18, 0.32);

  const materials = {
    sand: makeMaterial(scene, "sand", new Color3(0.64, 0.34, 0.17)),
    sandstone: makeMaterial(scene, "sandstone", new Color3(0.65, 0.28, 0.16)),
    rose: makeMaterial(scene, "rose", new Color3(0.42, 0.17, 0.2)),
    road: makeMaterial(scene, "road", new Color3(0.045, 0.075, 0.12)),
    gold: makeMaterial(scene, "gold", new Color3(0.92, 0.53, 0.16), new Color3(0.12, 0.05, 0.01)),
    turquoise: makeMaterial(scene, "turquoise", new Color3(0.04, 0.6, 0.62), new Color3(0.02, 0.16, 0.17)),
    pulse: makeMaterial(scene, "pulse", new Color3(0.95, 0.84, 0.34), new Color3(0.8, 0.42, 0.04)),
    glass: makeMaterial(scene, "glass", new Color3(0.06, 0.18, 0.3), new Color3(0.02, 0.08, 0.13)),
    dark: makeMaterial(scene, "dark", new Color3(0.025, 0.03, 0.055)),
    window: makeMaterial(scene, "window", new Color3(0.08, 0.15, 0.23), new Color3(0.06, 0.11, 0.18)),
    trunk: makeMaterial(scene, "trunk", new Color3(0.26, 0.13, 0.08)),
    leaf: makeMaterial(scene, "leaf", new Color3(0.04, 0.22, 0.2), new Color3(0.01, 0.04, 0.03)),
  };

  const hemi = new HemisphericLight("moon-sun", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.75;
  hemi.diffuse = new Color3(0.85, 0.76, 0.62);
  hemi.groundColor = new Color3(0.08, 0.06, 0.1);
  const sun = new DirectionalLight("golden-hour", new Vector3(-0.45, -1, 0.35), scene);
  sun.position = new Vector3(-50, 70, -40);
  sun.intensity = 1.4;
  sun.diffuse = new Color3(1, 0.64, 0.3);

  const camera = new FreeCamera("follow-camera", new Vector3(0, 8, -15), scene);
  camera.minZ = 0.1;
  camera.maxZ = 420;
  camera.fov = 0.92;
  camera.setTarget(new Vector3(0, 1.5, 0));
  scene.activeCamera = camera;

  const ground = MeshBuilder.CreateGround("desert-floor", { width: 210, height: 210, subdivisions: 2 }, scene);
  ground.material = materials.sand;
  for (const [x, z, w, d] of [[0, 0, 11, 190], [0, 0, 190, 11], [-42, 0, 7, 190], [42, 0, 7, 190], [0, -42, 190, 7], [0, 42, 190, 7]]) {
    const road = MeshBuilder.CreateBox(`road-${x}-${z}`, { width: w, height: 0.12, depth: d }, scene);
    road.position.set(x, 0.08, z);
    road.material = materials.road;
  }

  let seed = 17;
  for (const x of [-70, -54, -30, -18, 18, 30, 54, 70]) {
    for (const z of [-70, -54, -30, -18, 18, 30, 54, 70]) {
      if (Math.abs(x) < 14 || Math.abs(z) < 14) continue;
      createBuilding(scene, materials, x, z, seed++);
    }
  }

  const oasis = MeshBuilder.CreateCylinder("blue-oasis", { diameter: 32, height: 0.16, tessellation: 48 }, scene);
  oasis.position.set(52, 0.16, 38);
  oasis.scaling.z = 0.72;
  oasis.material = materials.turquoise;
  for (const [x, z, s] of [[42, 25, 0.9], [65, 26, 1], [36, 49, 0.8], [66, 50, 0.7], [-76, 35, 0.75], [76, -44, 0.85], [-72, -44, 0.9]]) createPalm(scene, materials, x, z, s);

  const cliffMat = makeMaterial(scene, "cliff", new Color3(0.3, 0.13, 0.12));
  for (const [x, z, s] of [[-92, -74, 2.8], [92, 68, 3.2], [-88, 67, 2.3], [88, -73, 2.6]]) {
    const cliff = MeshBuilder.CreateCylinder(`cliff-${x}-${z}`, { diameter: 18, height: 12, tessellation: 7 }, scene);
    cliff.position.set(x, 6, z);
    cliff.scaling.set(s, 1.2, s * 0.8);
    cliff.material = cliffMat;
  }

  const backdrop = MeshBuilder.CreatePlane("city-backdrop", { size: 2 }, scene);
  backdrop.position.set(0, 43, 116);
  backdrop.scaling.set(100, 56, 1);
  const backdropMaterial = new StandardMaterial("city-backdrop-material", scene);
  backdropMaterial.diffuseTexture = new Texture(KEY_ART, scene);
  backdropMaterial.emissiveTexture = backdropMaterial.diffuseTexture;
  backdropMaterial.emissiveColor = new Color3(0.55, 0.44, 0.32);
  backdropMaterial.backFaceCulling = false;
  backdrop.material = backdropMaterial;

  const shrine = MeshBuilder.CreateBox("quest-shrine", { width: 3.8, height: 2.8, depth: 2.8 }, scene);
  shrine.position.set(0, 1.4, 13);
  shrine.material = materials.dark;
  const shrineTop = MeshBuilder.CreateCylinder("quest-shrine-top", { diameter: 3.6, height: 0.5, tessellation: 6 }, scene);
  shrineTop.position.set(0, 3.05, 13);
  shrineTop.material = materials.gold;
  const emblem = MeshBuilder.CreatePlane("quest-emblem", { size: 2.2 }, scene);
  emblem.position.set(0, 2, 11.55);
  const emblemMaterial = new StandardMaterial("quest-emblem-material", scene);
  emblemMaterial.diffuseTexture = new Texture(EMBLEM, scene);
  emblemMaterial.emissiveTexture = emblemMaterial.diffuseTexture;
  emblemMaterial.emissiveColor = new Color3(0.45, 0.3, 0.12);
  emblemMaterial.backFaceCulling = false;
  emblem.material = emblemMaterial;

  const shardPositions = [[-34, -34], [34, -19], [57, 38], [-56, 34]];
  const shards = shardPositions.map(([x, z], index) => createBeacon(scene, materials, x, z, index));
  const drone = MeshBuilder.CreateSphere("scout-drone", { diameter: 1.15, segments: 16 }, scene);
  drone.material = materials.pulse;
  const droneLight = MeshBuilder.CreateSphere("scout-drone-light", { diameter: 0.35, segments: 10 }, scene);
  droneLight.material = materials.turquoise;

  const vehicle = new Vehicle(scene, materials);
  vehicle.position.set(0, 0.1, -10);
  vehicle.yaw = 0;

  const keys = new Set<string>();
  let started = false;
  let shardsCollected = 0;
  let dayProgress = 0.18;
  let message = "توجّه إلى منارات الضوء واجمع ثلاثة شظايا";
  let messageTimer = 3;
  let lastEmit = 0;
  let elapsed = 0;

  const state = (): GameState => {
    const hour = Math.floor((17 + dayProgress * 8) % 24);
    const minute = Math.floor(((17 + dayProgress * 8) % 1) * 60);
    const district = Math.hypot(vehicle.position.x, vehicle.position.z) < 22 ? "قلب المدينة" : vehicle.position.x > 35 && vehicle.position.z > 18 ? "واحة السُرى" : vehicle.position.z < -35 ? "مرتفعات القمر" : "الطريق الدائري";
    return {
      started,
      shards: shardsCollected,
      totalShards: 3,
      speed: Math.round(Math.abs(vehicle.speed) * 7.4),
      fuel: Math.max(18, 100 - Math.floor(elapsed / 14)),
      health: 100,
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      district,
      message,
      missionComplete: shardsCollected >= 3,
      playerX: vehicle.position.x,
      playerZ: vehicle.position.z,
      dayProgress,
    };
  };

  const emit = (force = false) => {
    const now = performance.now();
    if (force || now - lastEmit > 120) {
      window.dispatchEvent(new CustomEvent<GameState>("ow:update", { detail: state() }));
      lastEmit = now;
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      event.preventDefault();
      keys.add(key);
    }
    if (key === "e" && distance2D(vehicle.position, new Vector3(0, 0, 13)) < 9) {
      message = "مركز الملاحة جاهز — اجمع شظايا الضوء من أنحاء السُرى";
      messageTimer = 4;
      emit(true);
    }
  };
  const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
  const onStart = () => {
    started = true;
    message = "انطلق يا رحّال — أول منارة شمال غرب المدينة";
    messageTimer = 3;
    emit(true);
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("ow:start", onStart);

  scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
    elapsed += delta;
    dayProgress = (dayProgress + delta * 0.0032) % 1;
    vehicle.update(delta, keys, started);

    for (const shard of shards) {
      if (!shard.isDisposed()) {
        shard.rotation.y += delta * 1.8;
        shard.position.y = 1.8 + Math.sin(elapsed * 2.2 + shard.position.x) * 0.18;
        if (distance2D(vehicle.position, shard.position) < 3.7) {
          shard.dispose(false, true);
          shardsCollected = Math.min(4, shardsCollected + 1);
          message = shardsCollected >= 3 ? "اكتملت المهمة — عد إلى قلب المدينة لتسليم الشظايا" : `تم العثور على شظية ضوء (${shardsCollected}/3)`;
          messageTimer = 4;
          emit(true);
        }
      }
    }

    drone.position.set(16 + Math.sin(elapsed * 0.7) * 18, 6 + Math.sin(elapsed * 1.5) * 1.2, 20 + Math.cos(elapsed * 0.55) * 13);
    droneLight.position = drone.position.add(new Vector3(0, -0.1, 0));
    const desiredCamera = vehicle.position.add(new Vector3(-Math.sin(vehicle.yaw) * 12, 7.2, -Math.cos(vehicle.yaw) * 12));
    camera.position = Vector3.Lerp(camera.position, desiredCamera, Math.min(1, delta * 4.5));
    camera.setTarget(vehicle.position.add(new Vector3(0, 1.7, 2.2)));

    const isNight = dayProgress > 0.55;
    const sunFactor = Math.max(0.15, Math.sin(dayProgress * Math.PI * 2) * 0.45 + 0.55);
    hemi.intensity = 0.36 + sunFactor * 0.55;
    sun.intensity = 0.35 + sunFactor * 1.25;
    scene.clearColor = isNight ? new Color4(0.025, 0.04, 0.11, 1) : new Color4(0.14, 0.08, 0.14, 1);
    scene.fogColor = isNight ? new Color3(0.06, 0.09, 0.2) : new Color3(0.2, 0.14, 0.2);

    if (messageTimer > 0) messageTimer -= delta;
    if (messageTimer <= 0 && shardsCollected < 3) message = "اتبع العلامات الذهبية — الشظايا تضيء حين تقترب";
    emit();
  });

  emit(true);
  return {
    scene,
    dispose: () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("ow:start", onStart);
      scene.dispose();
    },
  };
}
