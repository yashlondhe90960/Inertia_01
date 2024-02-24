
// import { CuboidCollider, RigidBody } from "@react-three/rapier";
// const Player=()=>{
//     return(
//     <>
//     <RigidBody
//     position={[0,1,0]}
//     colliders="ball"
//     restitution={0.2}
//     friction={1}
//     canSleep={false}
//     >
//     <mesh castShadow position={[0,0.3,0]}>
//         <icosahedronGeometry args={[0.3,1]}/>
//         <meshStandardMaterial flatShading color="mediumpurple"/>
//     </mesh>
//     </RigidBody>
//     </>
//     )
// }

// export default Player;



import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";

const Player = () => {

  const resetTheBall = () => {
    body.current.setTranslation({ x: 0, y: 1, z: 0 });
    body.current.setLinvel({ x: 0, y: 0, z: 0 });
    body.current.setAngvel({ x: 0, y: 0, z: 0 });
  };


const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const blocksCount = useGame((state) => state.blocksCount);
  const restart = useGame((state) => state.restart);

  // First import useEffect abd then use it
  useEffect(() => {
    const unSubscribeKeys = subscribeKeys(() => {
      start();
    });

    const unSubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") {
          resetTheBall();
        }
      }
    );

    return () => {
      unSubscribeKeys();
      unSubscribeReset();
    };
  }, []);

  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward } = getKeys();
    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    if (forward === true) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }

    if (backward === true) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }

    if (rightward === true) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    if (leftward === true) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);

    /** Camera Control feature **/
    const bodyPosition = body.current.translation();
    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 2.25;
    cameraPosition.y += 0.65;

    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;

    // Lerping
    smoothedCameraPosition.lerp(cameraPosition, 3 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 3 * delta);

    // Move the camera to the new position
    state.camera.position.copy(smoothedCameraPosition);
    state.camera.lookAt(smoothedCameraTarget);

    /**
     * Phases
     */
    if (bodyPosition.z < -(blocksCount * 4 + 2)) {
      end();
    }
    if (bodyPosition.y < -4) {
      restart();
    }
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