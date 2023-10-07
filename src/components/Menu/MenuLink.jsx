import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import styles from "./menu.module.css";


const MenuLink = ({ catLink, image, color, category, title, username, date }) => {
  return (
    <Link href={catLink} className={styles.item}>
        {
          image ? 
          <div className={styles.imageContainer}>
            <Image src={image} alt="nice" fill className={styles.image}/>
          </div>
          :
          <>
          </>
          
        }
        <div className={styles.textContainer}>
        <span className={`${styles.category}`} style={{ background: color }}>{category}</span>
        <h3 className={styles.postTitle}>
            {title}
        </h3>
        <div className={styles.detail}>
            <span className={styles.username}>{username}</span>
            <span className={styles.date}>{date}</span>
        </div>
        </div>
    </Link>
  )
}

export default MenuLink