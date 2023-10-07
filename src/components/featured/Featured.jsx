import React from 'react';
import styles from "./featured.module.css";
import Image from 'next/image';

const Featured = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <b>Hey, Julia here!</b> Discover my stories and creative ideas here
      </h1>
      <div className={styles.post}>
        <div className={styles.imgContainer}>
          <Image src="/p1.jpeg" alt="p1image" fill className={styles.image} />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.postTitle}>this is tendo maya</h1>
          <p className={styles.postDesc}>
            kagayaki chansu wa ubyoudo
            chinuite kurai e kyouenchi
            ai no jiyuu no haisha ni zaregoto
            tenjou tenge, yui ga dokkuko
            99kisei, Tendo Maya
            naraku de miagerou,
            watashi ga star daaa
          </p>
          <p className={styles.postDesc}>
            Tsuki no kagayaki hoshi no ai
            Amata no hikari, atsumete ima
            Anata no kokoro ni todokemashou
            99kisei shuseki Tendo Maya
            Koyoi, hiramekiyo anatani
          </p>
          <button className={styles.button}>Read More</button>
        </div>
      </div>
    </div>
  )
}

export default Featured