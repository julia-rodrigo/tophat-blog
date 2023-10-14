import React from 'react';
import styles from "./categoryList.module.css";
import Category from './Category';


const getData = async () => {
  const res = await fetch("http://localhost:3000/api/categories", { cache: 'force-cache' })

  if (!res.ok) {
    throw new Error ("Failed recieving categies")
  }
  return res.json();
}

const CategoryList = async () => {  

  let data = await getData();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Popular Categories</h1>
      <div className={styles.categories}>
        { 
          data?.map(item => (
            <Category key={item._id} catLink="/blog?cat=coding" name={item.title} colour={item.color} image={item.img} />
          ))
        }
        {/* <Category catLink="/blog?cat=coding" name={"coding"} colour={'#6b57ff31'} image={"/style.png"}/>
        <Category catLink="/blog?cat=animation" name={"animation"} colour={'#da85c731'} image={"/style.png"}/>
        <Category catLink="/blog?cat=games" name={"games"} colour={'#a8ff5731'} image={"/style.png"}/>
        <Category catLink="/blog?cat=music" name={"music"} colour={'#57ffc431'} image={"/style.png"}/>
        <Category catLink="/blog?cat=things" name={"things"} colour={'#ffab5731'} image={"/style.png"}/>
        <Category catLink="/blog?cat=ideas" name={"ideas"} colour={'#57f9ff31'} image={"/style.png"}/>
        <Category catLink="/blog?cat=life" name={"life"} colour={'#ffe65731'} image={"/style.png"}/> */}
      </div>
    </div>
  )
}
export default CategoryList