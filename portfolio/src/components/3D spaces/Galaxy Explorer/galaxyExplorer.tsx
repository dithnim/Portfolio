import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { SolarSystem, createRandomSolarSystems } from "./solarSystem";

export default function GalaxyPortfolio() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const starsRef = useRef<{
    mesh: THREE.Points;
    velocities: THREE.Vector3[];
    originalPositions: THREE.Vector3[];
  } | null>(null);

  // Camera movement state
  const keysPressed = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
    ShiftLeft: false,
  });

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code in keysPressed.current) {
      keysPressed.current[event.code as keyof typeof keysPressed.current] =
        true;
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code in keysPressed.current) {
      keysPressed.current[event.code as keyof typeof keysPressed.current] =
        false;
    }
  }, []);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (isInitializedRef.current || !mountRef.current) return;

    isInitializedRef.current = true;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000 // Increased far plane for large galaxy
    );
    camera.position.set(0, 0, 50);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Galaxy particle field with individual star paths
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000; // Reduced for better performance with individual movement
    const starVertices: number[] = [];
    const starVelocities: THREE.Vector3[] = [];
    const originalPositions: THREE.Vector3[] = [];

    for (let i = 0; i < starCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(10000);
      const y = THREE.MathUtils.randFloatSpread(10000);
      const z = THREE.MathUtils.randFloatSpread(10000);

      starVertices.push(x, y, z);
      originalPositions.push(new THREE.Vector3(x, y, z));

      // Create random velocity for each star
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2, // Random X velocity
        (Math.random() - 0.5) * 0.2, // Random Y velocity
        (Math.random() - 0.5) * 0.2 // Random Z velocity
      );
      starVelocities.push(velocity);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    // Create rounded star material with custom shader
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: null },
      },
      vertexShader: `
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 3.0 * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          
          // Create perfectly circular stars with smooth edges
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 2.0); // Make the falloff more circular
          
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: false,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Store stars reference for animation
    starsRef.current = {
      mesh: stars,
      velocities: starVelocities,
      originalPositions: originalPositions,
    };

    // Create random solar systems with error handling
    let solarSystems: SolarSystem[] = [];
    try {
      solarSystems = createRandomSolarSystems(10, 2000); // Reduced count for better performance
      solarSystems.forEach((solarSystem) => {
        solarSystem.addToScene(scene);
      });
      console.log(`Created ${solarSystems.length} solar systems`);
    } catch (error) {
      console.error("Error creating solar systems:", error);
    }

    // Lighting for better texture visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Softer ambient light
    scene.add(ambientLight);

    // Add directional light to illuminate planets
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Add a second light from different angle for better detail
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -3, -5);
    scene.add(directionalLight2);

    // Camera movement speed
    const moveSpeed = 0.5;
    const rotationSpeed = 0.02;

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      animationIdRef.current = animationId;

      // Handle camera movement based on keyboard input
      const camera = cameraRef.current as THREE.PerspectiveCamera;
      if (camera) {
        // Forward/Backward movement (W/S or Arrow Up/Down)
        if (keysPressed.current.KeyW || keysPressed.current.ArrowUp) {
          camera.translateZ(-moveSpeed);
        }
        if (keysPressed.current.KeyS || keysPressed.current.ArrowDown) {
          camera.translateZ(moveSpeed);
        }

        // Left/Right movement (A/D or Arrow Left/Right)
        if (keysPressed.current.KeyA || keysPressed.current.ArrowLeft) {
          camera.translateX(-moveSpeed);
        }
        if (keysPressed.current.KeyD || keysPressed.current.ArrowRight) {
          camera.translateX(moveSpeed);
        }

        // Up/Down movement (Space/Shift)
        if (keysPressed.current.Space) {
          camera.translateY(moveSpeed);
        }
        if (keysPressed.current.ShiftLeft) {
          camera.translateY(-moveSpeed);
        }
      }

      // Update individual star positions
      if (starsRef.current) {
        const positions = starsRef.current.mesh.geometry.attributes.position;
        const velocities = starsRef.current.velocities;
        const originalPositions = starsRef.current.originalPositions;

        for (let i = 0; i < velocities.length; i++) {
          const i3 = i * 3;

          // Update position based on velocity
          positions.array[i3] += velocities[i].x;
          positions.array[i3 + 1] += velocities[i].y;
          positions.array[i3 + 2] += velocities[i].z;

          // Reset star position if it goes too far from original position
          const currentPos = new THREE.Vector3(
            positions.array[i3],
            positions.array[i3 + 1],
            positions.array[i3 + 2]
          );

          if (currentPos.distanceTo(originalPositions[i]) > 500) {
            positions.array[i3] = originalPositions[i].x;
            positions.array[i3 + 1] = originalPositions[i].y;
            positions.array[i3 + 2] = originalPositions[i].z;

            // Randomize velocity again
            velocities[i].set(
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2
            );
          }
        }

        positions.needsUpdate = true;
      }

      // Update solar systems
      solarSystems.forEach((solarSystem) => {
        solarSystem.update(0.016); // Assuming 60fps
      });

      renderer.render(scene, camera);
    };
    animate();

    // Add keyboard event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Handle window resize
    const handleResize = () => {
      const camera = cameraRef.current as THREE.PerspectiveCamera;
      if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => {
      isInitializedRef.current = false;

      // Cancel animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      // Cleanup solar systems
      solarSystems.forEach((solarSystem) => {
        solarSystem.removeFromScene(scene);
        solarSystem.dispose();
      });

      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Remove event listeners
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);

      // Dispose of renderer
      renderer.dispose();
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
      starsRef.current = null;
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div ref={mountRef} style={{ width: "100vw", height: "100vh" }}>
      {/* Controls instructions */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "5px",
          zIndex: 1000,
        }}
      >
        <div>🎮 Navigation Controls:</div>
        <div>WASD or Arrow Keys: Move horizontally</div>
        <div>Space: Move up</div>
        <div>Shift: Move down</div>
      </div>
    </div>
  );
}
