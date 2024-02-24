import { OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import Lights from "./Lights";
import Level from "./Level";
import { Physics } from '@react-three/rapier'
// Rest of your Experience component remains unchanged
export default function Experience() {
  

  return (
    <>
      <Lights />
      <Physics debug>
       <Level 
       obstacleCount={10}/>
      </Physics>
    </>
  );
}
