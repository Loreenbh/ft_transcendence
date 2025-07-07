import { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  FreeCamera,
  Vector3,
  PBRMaterial,
  HemisphericLight,
  SceneLoader,
  Color3,
  MeshBuilder,
  CubeTexture,
  DynamicTexture,
  Mesh,
  AbstractMesh,
  StandardMaterial,
  Texture
} from '@babylonjs/core';
import "@babylonjs/loaders";




//GLOBAL VARIABLES
const tshirtTurnament: Mesh[] = [];
let currentPage = 0;
const tshirtPerPage = 1;

const BabylonScene = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
      const engine = new Engine(canvasRef.current, true);
      const scene = new Scene(engine);

      const camera = new FreeCamera("freeCamera", new Vector3(0, 5, -10), scene);
      camera.attachControl(canvasRef.current, true);
      camera.speed = 0.5;

      // Charge la texture HDR (.env) et l'assigne à la scène
      const hdrTexture = CubeTexture.CreateFromPrefilteredData("/background.env", scene);
      scene.environmentIntensity = 1.0; //activer l illumination de l env
      scene.environmentTexture = hdrTexture;

      // Crée la skybox avec la texture HDR, taille 1000, parametre intensite HDRI
      scene.createDefaultSkybox(hdrTexture, true, 1000, 0);

      generateTshirt(scene);
      // Boucle de rendu
      engine.runRenderLoop(() => {
        scene.render();
      });


      // Gestion du redimensionnement
      window.addEventListener("resize", () => {
        engine.resize();
      });

      // Nettoyage
      return () => {
      engine.dispose();
      window.removeEventListener("resize", () => {
          engine.resize();
      });
      };
  }, []); //ajouter scene ici pour ne pas avoir besoin de recharger

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />;

};

function generateTshirt(scene: Scene, hdrTexture: CubeTexture) {
  const nbInscriptions = 1;
  SceneLoader.ImportMesh("", "/vestiary/", "tshirt.glb", scene, (meshes: AbstractMesh[]) => {
  const modele = meshes[0];
  modele.setEnabled(false);

  for (let i = 0; i < nbInscriptions; i++){
    const clone = modele.clone("tshirt_" + i);
    if (clone){
      //penser a clean dynamicTexture
      const dynamicTexture = new DynamicTexture("uvtest" + i,
        {width: 750, height: 500},
        scene,
        true
      );
    dynamicTexture.hasAlpha = true;

    dynamicTexture.clear(null);

    dynamicTexture.drawText(
      "Montexte",  // texte à écrire
      null,               // x centré
      200,                // y vertical
      "bold 20px Arial",  // police et taille
      "red",            // couleur texte
      "rgb(39, 120, 241)",      // fond transparent
      true                // centrer horizontalement
    );
    dynamicTexture.update();

    const material = new PBRMaterial("mat_" + i, scene);
    material.albedoTexture = dynamicTexture;
    material.environmentTexture = hdrTexture;
    material.environmentIntensity = 1.5;
    material.metallic = 0;    // plastique (0), métal (1)
    material.roughness = 0.2; // rugosité moyenne

    // Application du matériau au clone

  clone.getChildMeshes().forEach((child: AbstractMesh) => console.log(child.name));
  clone.getChildMeshes().forEach((child: AbstractMesh) => {
    if (child.name.includes("Tshirt")) {
      child.material = material;
    }
  });

    //Ajouter le clone au tableau global
    tshirtTurnament.push(clone);
    }
  }
  displayTshirt();
  })
}; 

  function displayTshirt(){
  // Tout masquer
  tshirtTurnament.forEach(t => t.setEnabled(false));
  //Afficher seulement ceux de la page actuelle
  const start = currentPage * tshirtPerPage;
  const end = Math.min(start + tshirtPerPage, tshirtTurnament.length);
  
  for (let i = start; i < end; i++){
    const tshirt = tshirtTurnament[i];
        tshirt.setEnabled(true);
    // Positionnement simple, adapte selon ton besoin
          tshirt.position = new Vector3(2 + i * 1.5, 0, 4);
          tshirt.rotation.y = Math.PI / 2;
  }
  console.log("TOUT EST OK!");
  // updateButtons();
};


// function updateButtons(){
//   const objectLeft = scene.getMeshByName("infoLeft");
//   const objectRight = scene.getMeshByName("infoRight");
//   if (!objectLeft || !objectRight) return;
//   if (tshirtTurnament.length > tshirtPerPage) {
//     objectLeft.material.diffuseColor = new Color3(1, 1, 0);  // Jaune
//     objectRight.material.diffuseColor = new Color3(1, 1, 0);

//     // Optionnel : ajouter une émissive pour que ça brille
//     objectLeft.material.emissiveColor = new Color3(1, 1, 0.2);
//     objectRight.material.emissiveColor = new Color3(1, 1, 0.2);
//   } 
//   else {
//     // Sinon, couleur par défaut
//     objectLeft.material.diffuseColor = new Color3(0.5, 0.5, 0.5);  // gris
//     objectRight.material.diffuseColor = new Color3(0.5, 0.5, 0.5);
//     objectLeft.material.emissiveColor = Color3.Black();
//     objectRight.material.emissiveColor = Color3.Black();
//   }
// }

//   function nextPage() {
//   if ((currentPage + 1) * tshirtPerPage < tshirtTurnament.length) {
//     currentPage++;
//     displayTshirt();
//   }
// }

//   function prevPage() {
//   if (currentPage > 0) {
//     currentPage--;
//     displayTshirt();
//   }
// }




export default BabylonScene;