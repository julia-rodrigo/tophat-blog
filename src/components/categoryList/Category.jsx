import React from 'react'
import styles from "./categoryList.module.css";
import Link from 'next/link';
import Image from 'next/image';

const Category = ({ catLink, name, colour, image}) => {
  return (
    <Link href={catLink} className={`${styles.category}`} style={{ background: colour}}>
        {
          image && 
          <Image
              src={image}
              alt=""
              width={32}
              height={32}
              className={styles.image}
          />
        }
        {name}
    </Link>
  )
}

export default Category