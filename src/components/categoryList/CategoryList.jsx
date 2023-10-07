import React from 'react';
import styles from "./categoryList.module.css";
import Link from 'next/link';
import Image from 'next/image';

const CategoryList = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Popular Categories</h1>
      <div className={styles.categories}>
        <Link href="/blog" className={`${styles.category} ${styles.coding}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          coding
        </Link>
        <Link href="/blog" className={`${styles.category} ${styles.animation}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          animation
        </Link>
        <Link href="/blog" className={`${styles.category} ${styles.games}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          games
        </Link>

        <Link href="/blog" className={`${styles.category} ${styles.music}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          music
        </Link>

        <Link href="/blog" className={`${styles.category} ${styles.things}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          things
        </Link>

        <Link href="/blog" className={`${styles.category} ${styles.ideas}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          ideas
        </Link>
        <Link href="/blog" className={`${styles.category} ${styles.life}`}>
          <Image
            src="/style.png"
            alt=""
            width={32}
            height={32}
            className={styles.image}
          />
          life
        </Link>
      </div>
    </div>
  )
}
export default CategoryList