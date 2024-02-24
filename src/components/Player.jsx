import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";

const Player = () => {
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  useFrame(() => {
    const { forward, backward, leftward, rightward } = getKeys();
    const impulse = {
      x: 0,
      y: 0,
      z: 0,
    };
    body.current.applyImpulse(impulse);
  });

  return (
    <RigidBody
      ref={body}
      position={[0, 1, 0]}
      colliders="ball"
      restitution={0.2}
      friction={1}
      canSleep={false}
    >
      <mesh castShadow position={[0, 0.3, 0]}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial flatShading color="mediumpurple" />
      </mesh>
    </RigidBody>
  );
};

export default Player;