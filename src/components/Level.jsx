import React, { useRef, useState } from "react";
import * as THREE from "three";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const floor1Material = new THREE.MeshStandardMaterial({ color: "limegreen" });
const floor2Material = new THREE.MeshStandardMaterial({ color: "greenyellow" });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: "orangered" });
const wallMaterial = new THREE.MeshStandardMaterial({ color: "slategrey" });

const BlockStart = ({ positionProp = [0, 0, 0] }) => {
  const blockHeight = 0.2;
  const blockSize = 4;
  return (
    <>
      <group position={positionProp}>
        <mesh
          geometry={boxGeometry}
          receiveShadow
          position={[0, -1 * (blockHeight / 2), 0]}
          scale={[blockSize, blockHeight, blockSize]}
          material={floor1Material}
        ></mesh>
      </group>
    </>
  );
};

const BlockObstacle = ({ positionProp = [0, 0, 0], obstaclePosition }) => {
  const blockHeight = 0.2;
  const blockSize = 4;
  const obstacle = useRef();

  const [timeOffset] = useState(() => {
    return Math.random() * Math.PI * 2;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const x_axis = Math.sin(time + timeOffset) * 1.25;
    obstacle.current.setNextKinematicTranslation({
      x: positionProp[0] + x_axis,
      y: positionProp[1] + 0.75,
      z: positionProp[2],
    });
  });

  return (
    <>
      <group position={positionProp}>
        <mesh
          geometry={boxGeometry}
          receiveShadow
          position={[0, -1 * (blockHeight / 2), 0]}
          scale={[blockSize, blockHeight, blockSize]}
          material={floor2Material}
        ></mesh>

        <RigidBody
          ref={obstacle}
          type="kinematicPosition"
          restitution={0.2}
          friction={0}
          position={
            obstaclePosition === "left" ? [-1.25, 0.75, 0] : [1.25, 0.75, 0]
          }
        >
          <mesh
            geometry={boxGeometry}
            material={obstacleMaterial}
            scale={[1.5, 1.5, 0.3]}
            castShadow
            receiveShadow
          ></mesh>
        </RigidBody>
      </group>
    </>
  );
};

const BlockEnd = ({ positionProp = [0, 0, 0] }) => {
  const { scene } = useGLTF("models/treasure.glb");
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }, [scene]);
  const blockHeight = 0.2;
  const blockSize = 4;
  return (
    <>
      <group position={positionProp}>
        <RigidBody type="fixed">
          <mesh
            geometry={boxGeometry}
            receiveShadow
            position={[0, 0, 0]}
            scale={[blockSize, blockHeight, blockSize]}
            material={floor1Material}
          ></mesh>
        </RigidBody>
        <RigidBody type="fixed" colliders="hull" restitution={0.2} friction={0}>
          <primitive position={[0, 0.1, 0]} object={scene} scale={0.025} />
        </RigidBody>
      </group>
    </>
  );
};

const Walls = ({ length }) => {
  return (
    <>
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <mesh
          position={[2.15, 0.75, -(length * 2) + 2]}
          geometry={boxGeometry}
          material={wallMaterial}
          scale={[0.3, 1.5, length * 4]}
          castShadow
        ></mesh>

        <mesh
          position={[-1 * 2.15, 0.75, -(length * 2) + 2]}
          geometry={boxGeometry}
          material={wallMaterial}
          scale={[0.3, 1.5, length * 4]}
          receiveShadow
        ></mesh>

        <mesh
          position={[0, 0.75, -(length * 4) + 2]}
          geometry={boxGeometry}
          material={wallMaterial}
          scale={[4, 1.5, 0.3]}
          receiveShadow
        ></mesh>

        <CuboidCollider
          args={[2, 0.1, 2 * length]}
          position={[0, -0.1, -(length * 2) + 2]}
          restitution={0.2}
          friction={1}
        />
      </RigidBody>
    </>
  );
};

const Level = ({ obstacleCount = 5 }) => {
  const zAxisShift = 4;
  const blocksArray = useMemo(() => {
    const blocks = [];
    for (let i = 1; i <= obstacleCount; i++) {
      const position = [0, 0, -i * zAxisShift];
      blocks.push(
        <BlockObstacle
          positionProp={position}
          obstaclePosition={i % 2 === 0 ? "left" : "right"}
        />
      );
    }
    return blocks;
  }, [obstacleCount]);

  return (
    <>
      <BlockStart positionProp={[0, 0, 0]} />
      {blocksArray.map((Block, index) => (
        <React.Fragment key={index}>{Block}</React.Fragment>
      ))}
      <BlockEnd positionProp={[0, 0, -1 * (obstacleCount + 1) * zAxisShift]} />
      <Walls length={obstacleCount + 2} />
    </>
  );
};

export default Level;