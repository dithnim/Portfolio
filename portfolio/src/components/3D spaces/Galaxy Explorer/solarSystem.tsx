import * as THREE from "three";

// Planet texture data
interface PlanetTextureData {
  texture: string;
  color: number;
  type: "rocky" | "gas" | "ice" | "desert";
}

const PLANET_TEXTURES: PlanetTextureData[] = [
  {
    texture: "/textures/planet/mercury.jpg",
    color: 0x8c7853,
    type: "rocky",
  },
  {
    texture: "/textures/planet/venus_surface.jpg",
    color: 0xffc649,
    type: "desert",
  },
  {
    texture: "/textures/planet/earth_daymap.jpg",
    color: 0x6b93d6,
    type: "rocky",
  },
  {
    texture: "/textures/planet/mars.jpg",
    color: 0xcd5c5c,
    type: "desert",
  },
  {
    texture: "/textures/planet/jupiter.jpg",
    color: 0xd2691e,
    type: "gas",
  },
  {
    texture: "/textures/planet/saturn.jpg",
    color: 0xffd700,
    type: "gas",
  },
  {
    texture: "/textures/planet/uranus.jpg",
    color: 0x4fd0e3,
    type: "ice",
  },
  {
    texture: "/textures/planet/neptune.jpg",
    color: 0x4169e1,
    type: "ice",
  },
];

export interface Planet {
  mesh: THREE.Mesh;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  angle: number;
}

export interface SolarSystemData {
  sun: THREE.Mesh;
  planets: Planet[];
  position: THREE.Vector3;
}

export class SolarSystem {
  public sun!: THREE.Mesh;
  public planets: Planet[] = [];
  public group: THREE.Group;
  private sunLight!: THREE.PointLight;
  private textureLoader: THREE.TextureLoader;

  constructor(position: THREE.Vector3) {
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.textureLoader = new THREE.TextureLoader();

    this.createSun();
    this.createPlanets();
    this.createSunLight();
  }

  private createSun(): void {
    // Random sun size and color
    const sunRadius = Math.random() * 3 + 2; // 2-5 radius
    const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32);

    // Random sun colors (yellow, orange, red, white, blue)
    const sunColors = [
      0xffff00, // Yellow
      0xffa500, // Orange
      0xff4500, // Red-orange
      0xffffff, // White
      0x87ceeb, // Blue
      0xffd700, // Gold
    ];

    const sunColor = sunColors[Math.floor(Math.random() * sunColors.length)];

    // Create glowing sun material
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: sunColor,
      transparent: true,
      opacity: 0.9,
    });

    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.group.add(this.sun);
  }

  private createSunLight(): void {
    // Add point light at sun's position
    const sunColor = (this.sun.material as THREE.MeshBasicMaterial).color;
    this.sunLight = new THREE.PointLight(sunColor.getHex(), 0.5, 100);
    this.sunLight.position.set(0, 0, 0);
    this.group.add(this.sunLight);
  }

  private createPlanets(): void {
    const numPlanets = Math.floor(Math.random() * 6) + 2; // 2-7 planets

    for (let i = 0; i < numPlanets; i++) {
      const planet = this.createRandomPlanet(i);
      this.planets.push(planet);
      this.group.add(planet.mesh);
    }
  }

  private createRandomPlanet(index: number): Planet {
    // Planet properties
    const radius = Math.random() * 1.5 + 0.3; // 0.3-1.8 radius
    const orbitRadius = (index + 1) * (Math.random() * 3 + 5); // Varying orbit distances
    const orbitSpeed = (Math.random() * 0.02 + 0.005) / (index + 1); // Closer = faster
    const rotationSpeed = Math.random() * 0.1 + 0.005; // Random rotation speed between 0.005-0.105

    // Select a random planet texture
    const planetTextureData =
      PLANET_TEXTURES[Math.floor(Math.random() * PLANET_TEXTURES.length)];

    // Load the texture
    const planetTexture = this.textureLoader.load(planetTextureData.texture);

    // Create planet geometry and material with texture
    const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      color: planetTextureData.color,
      roughness: 0.8,
      metalness: 0.1,
      transparent: false, // Ensure planets are not transparent
      opacity: 1.0,
    });

    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

    // Set initial position
    const angle = Math.random() * Math.PI * 2;
    planetMesh.position.x = Math.cos(angle) * orbitRadius;
    planetMesh.position.z = Math.sin(angle) * orbitRadius;
    planetMesh.position.y = (Math.random() - 0.5) * 2; // Slight orbital inclination

    return {
      mesh: planetMesh,
      orbitRadius,
      orbitSpeed,
      rotationSpeed,
      angle,
    };
  }

  public update(deltaTime: number): void {
    // Rotate sun
    this.sun.rotation.y += 0.01;

    // Update planets
    this.planets.forEach((planet) => {
      // Update orbit angle
      planet.angle += planet.orbitSpeed;

      // Update planet position in orbit
      planet.mesh.position.x = Math.cos(planet.angle) * planet.orbitRadius;
      planet.mesh.position.z = Math.sin(planet.angle) * planet.orbitRadius;

      // Rotate planet on its axis
      planet.mesh.rotation.y += planet.rotationSpeed;
    });
  }

  public addToScene(scene: THREE.Scene): void {
    scene.add(this.group);
  }

  public removeFromScene(scene: THREE.Scene): void {
    scene.remove(this.group);
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position;
  }

  public dispose(): void {
    // Clean up geometries and materials
    this.sun.geometry.dispose();
    (this.sun.material as THREE.Material).dispose();

    this.planets.forEach((planet) => {
      planet.mesh.geometry.dispose();
      (planet.mesh.material as THREE.Material).dispose();
    });
  }
}

export function createRandomSolarSystems(
  count: number,
  spread: number = 1000
): SolarSystem[] {
  const solarSystems: SolarSystem[] = [];

  for (let i = 0; i < count; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread * 0.2, // Less spread in Y
      (Math.random() - 0.5) * spread
    );

    const solarSystem = new SolarSystem(position);
    solarSystems.push(solarSystem);
  }

  return solarSystems;
}
